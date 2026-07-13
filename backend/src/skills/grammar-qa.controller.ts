import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { AskGrammarDto } from './dto/ask-grammar.dto';

@ApiTags('grammar-qa')
@ApiBearerAuth()
@Controller('grammar-qa')
export class GrammarQaController {
  constructor(private readonly ai: AiService) {}

  @Post('ask')
  @AiThrottle()
  @ApiOperation({
    summary: 'Ask a grammar question (keeps context via history) (UC15)',
  })
  async ask(@Body() dto: AskGrammarDto) {
    const answer = await this.ai.grammarQa(dto.history ?? [], dto.question);
    return { answer };
  }
}
