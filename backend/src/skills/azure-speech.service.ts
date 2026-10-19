import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import type { AzureAssessment } from '../ai/features/pronunciation';
import { parseWav } from './wav-parser';

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
              this.logger.warn(`Azure assessment canceled: ${cancel.reason}`);
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
          this.logger.error('Azure recognizeOnce request failed');
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
    this.logger.error('Unexpected Azure assessment failure');
    return new ServiceUnavailableException({
      message: 'Pronunciation assessment failed, please try again',
      retryable: true,
    });
  }
}
