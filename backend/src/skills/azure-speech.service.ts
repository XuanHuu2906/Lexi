import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import type { AzureAssessment } from '../ai/features/pronunciation';

interface WavInfo {
  sampleRate: number;
  bitsPerSample: number;
  channels: number;
  data: Buffer;
}

/**
 * Parse a canonical PCM WAV buffer into its format + raw sample data. We feed
 * the PCM into Azure via a push stream with a matching format, which avoids the
 * File/DOM dependency of `AudioConfig.fromWavFileInput` and any server-side
 * transcoding. Walks the RIFF chunks rather than assuming a fixed 44-byte header.
 */
function parseWav(buf: Buffer): WavInfo {
  if (
    buf.length < 44 ||
    buf.toString('ascii', 0, 4) !== 'RIFF' ||
    buf.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    throw new UnprocessableEntityException('Invalid WAV audio');
  }
  let offset = 12;
  let fmt: Omit<WavInfo, 'data'> | null = null;
  let data: Buffer | null = null;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === 'fmt ') {
      fmt = {
        channels: buf.readUInt16LE(body + 2),
        sampleRate: buf.readUInt32LE(body + 4),
        bitsPerSample: buf.readUInt16LE(body + 14),
      };
    } else if (id === 'data') {
      data = buf.subarray(body, Math.min(body + size, buf.length));
    }
    // RIFF chunks are word-aligned (pad byte when size is odd).
    offset = body + size + (size % 2);
  }
  if (!fmt || !data) {
    throw new UnprocessableEntityException('WAV missing fmt/data chunk');
  }
  return { ...fmt, data };
}

/**
 * Wraps Azure Speech's Pronunciation Assessment. Used only by the pronunciation
 * skill; the API key/region stay confined here. When unconfigured, callers fall
 * back to the LLM text scorer.
 */
@Injectable()
export class AzureSpeechService {
  private readonly logger = new Logger(AzureSpeechService.name);
  private readonly key?: string;
  private readonly region?: string;

  constructor(config: ConfigService) {
    this.key = config.get<string>('AZURE_SPEECH_KEY') || undefined;
    this.region = config.get<string>('AZURE_SPEECH_REGION') || undefined;
    if (!this.isConfigured()) {
      this.logger.warn(
        'AZURE_SPEECH_KEY/AZURE_SPEECH_REGION not set — pronunciation will use the LLM fallback scorer',
      );
    }
  }

  isConfigured(): boolean {
    return Boolean(this.key && this.region);
  }

  /** Run pronunciation assessment on a PCM WAV recording against the target. */
  assess(wav: Buffer, referenceText: string): Promise<AzureAssessment> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException({
        message: 'Azure pronunciation assessment is not configured',
        retryable: false,
      });
    }

    const { sampleRate, bitsPerSample, channels, data } = parseWav(wav);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      this.key!,
      this.region!,
    );
    speechConfig.speechRecognitionLanguage = 'en-US';

    const format = sdk.AudioStreamFormat.getWaveFormatPCM(
      sampleRate,
      bitsPerSample,
      channels,
    );
    const pushStream = sdk.AudioInputStream.createPushStream(format);
    // Copy into a standalone ArrayBuffer (the Buffer may be a slice of a pool).
    // `Buffer.buffer` is typed ArrayBuffer | SharedArrayBuffer; a Node Buffer is
    // always backed by a real ArrayBuffer at runtime, so the cast is safe.
    const ab = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
    pushStream.write(ab);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const paConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true, // enableMiscue — detect omissions/insertions vs the reference
    );
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    paConfig.applyTo(recognizer);

    return new Promise<AzureAssessment>((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          try {
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
              resolve(this.toAssessment(result));
            } else if (result.reason === sdk.ResultReason.NoMatch) {
              reject(
                new UnprocessableEntityException({
                  message: 'No clear speech detected, please try again',
                  retryable: false,
                }),
              );
            } else if (result.reason === sdk.ResultReason.Canceled) {
              const cancel = sdk.CancellationDetails.fromResult(result);
              this.logger.error(
                `Azure assessment canceled: ${cancel.reason} ${cancel.errorDetails}`,
              );
              reject(
                new ServiceUnavailableException({
                  message: 'Pronunciation assessment failed, please try again',
                  retryable: true,
                }),
              );
            } else {
              reject(
                new ServiceUnavailableException({
                  message: 'Pronunciation assessment failed, please try again',
                  retryable: true,
                }),
              );
            }
          } catch (err) {
            reject(this.wrap(err));
          } finally {
            recognizer.close();
          }
        },
        (err) => {
          recognizer.close();
          this.logger.error(`Azure recognizeOnce error: ${String(err)}`);
          reject(
            new ServiceUnavailableException({
              message: 'Pronunciation assessment failed, please try again',
              retryable: true,
            }),
          );
        },
      );
    });
  }

  private toAssessment(result: sdk.SpeechRecognitionResult): AzureAssessment {
    const pa = sdk.PronunciationAssessmentResult.fromResult(result);
    const words = (pa.detailResult?.Words ?? []).map((w) => ({
      word: w.Word,
      accuracy: w.PronunciationAssessment?.AccuracyScore ?? 0,
      errorType: w.PronunciationAssessment?.ErrorType ?? 'None',
    }));
    return {
      accuracy: pa.accuracyScore,
      fluency: pa.fluencyScore,
      completeness: pa.completenessScore,
      pronunciation: pa.pronunciationScore,
      transcript: result.text ?? '',
      words,
    };
  }

  private wrap(err: unknown): Error {
    if (
      err instanceof ServiceUnavailableException ||
      err instanceof UnprocessableEntityException
    ) {
      return err;
    }
    this.logger.error(`Unexpected Azure error: ${String(err)}`);
    return new ServiceUnavailableException({
      message: 'Pronunciation assessment failed, please try again',
      retryable: true,
    });
  }
}
