import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { GradeWritingDto } from './dto/grade-writing.dto';

@ApiTags('writing')
@ApiBearerAuth()
@Controller('writing')
export class WritingController {
  constructor(private readonly ai: AiService) {}

  @Post('grade')
  @AiThrottle()
  @ApiOperation({ summary: 'Grade a piece of writing (UC14)' })
  grade(@Body() dto: GradeWritingDto) {
    return this.ai.gradeWriting(dto.text);
  }
}
