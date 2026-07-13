import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { ClassifyInputDto } from './dto/classify-input.dto';

// UC19 — classify a free-text quick-input so the client can route it to
// /words (vocabulary) or /grammar (grammar). Returns a preview for confirmation;
// nothing is saved here.
@ApiTags('smart-input')
@ApiBearerAuth()
@Controller('smart-input')
export class SmartInputController {
  constructor(private readonly ai: AiService) {}

  @Post('classify')
  @AiThrottle()
  @ApiOperation({
    summary: 'Classify quick-input as vocabulary vs grammar (preview)',
  })
  classify(@Body() dto: ClassifyInputDto) {
    return this.ai.classifyInput(dto.text.trim());
  }
}
