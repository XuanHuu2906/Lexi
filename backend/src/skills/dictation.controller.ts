import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { GenerateDictationDto } from './dto/generate-dictation.dto';
import { ExplainDictationDto } from './dto/explain-dictation.dto';

@ApiTags('dictation')
@ApiBearerAuth()
@Controller('dictation')
export class DictationController {
  constructor(private readonly ai: AiService) {}

  @Post('generate')
  @AiThrottle()
  @ApiOperation({ summary: 'Generate sentences to dictate (listen & type)' })
  generate(@Body() dto: GenerateDictationDto) {
    return this.ai.generateDictation(dto);
  }

  @Post('explain')
  @AiThrottle()
  @ApiOperation({ summary: 'Explain a dictation mistake in Vietnamese' })
  explain(@Body() dto: ExplainDictationDto) {
    return this.ai.explainDictation(dto.reference, dto.attempt);
  }
}
