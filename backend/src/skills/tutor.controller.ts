import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { AskTutorDto } from './dto/ask-tutor.dto';

@ApiTags('tutor')
@ApiBearerAuth()
@Controller('tutor')
export class TutorController {
  constructor(private readonly ai: AiService) {}

  @Post('ask')
  @AiThrottle()
  @ApiOperation({
    summary: 'Ask Lexi anything — general-knowledge tutor chat (keeps context)',
  })
  ask(@Body() dto: AskTutorDto) {
    // Returns { answer, words, grammar } — the prose reply plus one-tap
    // saveable vocabulary and grammar takeaways extracted from it.
    return this.ai.tutorAsk(dto.history ?? [], dto.question);
  }
}
