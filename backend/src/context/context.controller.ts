import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { AnalyzeContextDto } from './dto/analyze-context.dto';

// UC07 — analyse a passage and highlight the words worth learning at the
// learner's level. Stateless AI skill; nothing is persisted here.
@ApiTags('context')
@ApiBearerAuth()
@Controller('context')
export class ContextController {
  constructor(private readonly ai: AiService) {}

  @Post('analyze')
  @AiThrottle()
  @ApiOperation({
    summary: 'Highlight difficult words in a passage for the learner (UC07)',
  })
  analyze(@Body() dto: AnalyzeContextDto) {
    return this.ai.analyzeContext(dto.passage, { level: dto.level });
  }
}
