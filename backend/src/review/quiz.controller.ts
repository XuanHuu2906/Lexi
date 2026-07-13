import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  GenerateQuizDto,
  SaveQuizProgressDto,
  SubmitQuizDto,
} from './dto/quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('quiz')
@ApiBearerAuth()
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  @AiThrottle()
  @ApiOperation({ summary: 'Generate an MCQ quiz from saved words (UC11)' })
  generate(
    @CurrentUser('userId') userId: string,
    @Body() dto: GenerateQuizDto,
  ) {
    return this.quizService.generate(userId, dto);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Grade and finalise a quiz (UC11)' })
  submit(@CurrentUser('userId') userId: string, @Body() dto: SubmitQuizDto) {
    return this.quizService.submit(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Resume a quiz (answers hidden until submitted)' })
  get(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.quizService.get(userId, id);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Save partial answers to resume later' })
  saveProgress(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: SaveQuizProgressDto,
  ) {
    return this.quizService.saveProgress(userId, id, dto);
  }
}
