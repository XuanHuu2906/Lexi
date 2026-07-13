import {
  BadRequestException,
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import type { PronunciationResult } from '../ai/features/pronunciation';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { AzureSpeechService } from './azure-speech.service';
import { ScorePronunciationDto } from './dto/score-pronunciation.dto';

@ApiTags('pronunciation')
@ApiBearerAuth()
@Controller('pronunciation')
export class PronunciationController {
  constructor(
    private readonly ai: AiService,
    private readonly azure: AzureSpeechService,
  ) {}

  // Accepts multipart with an optional `audio` WAV file plus text fields.
  //  - With `audio` + Azure configured → real acoustic assessment (UC13).
  //  - Otherwise → LLM text-comparison fallback using `recognizedText`
  //    (front-end Web Speech API), which also covers browsers without the
  //    recording path.
  @Post('score')
  @AiThrottle()
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Score pronunciation — Azure assessment from audio, or text fallback (UC13)',
  })
  async score(
    @UploadedFile() audio: Express.Multer.File | undefined,
    @Body() dto: ScorePronunciationDto,
  ): Promise<PronunciationResult> {
    if (audio?.buffer?.length) {
      // Signal the client to fall back to its Web Speech path (retryable: false).
      if (!this.azure.isConfigured()) {
        throw new ServiceUnavailableException({
          message: 'Azure pronunciation assessment is not configured',
          retryable: false,
        });
      }
      const assessment = await this.azure.assess(audio.buffer, dto.referenceText);
      return this.ai.scorePronunciationFromAzure(dto.referenceText, assessment);
    }

    if (!dto.recognizedText) {
      throw new BadRequestException(
        'Provide an audio recording or recognizedText',
      );
    }
    return this.ai.scorePronunciation(dto.referenceText, dto.recognizedText);
  }
}
