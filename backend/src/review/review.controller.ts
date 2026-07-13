import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnswerDto } from './dto/answer.dto';
import { DueDto } from './dto/due.dto';
import { FlashcardsDto } from './dto/flashcards.dto';
import { ReviewService } from './review.service';

@ApiTags('review')
@ApiBearerAuth()
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('due')
  @ApiOperation({ summary: 'Words due for review (UC09)' })
  due(@CurrentUser('userId') userId: string, @Query() query: DueDto) {
    return this.reviewService.due(userId, query.limit);
  }

  @Post('answer')
  @ApiOperation({
    summary: 'Record a review answer, reschedule via SM-2 (UC09)',
  })
  answer(@CurrentUser('userId') userId: string, @Body() dto: AnswerDto) {
    return this.reviewService.answer(userId, dto);
  }

  @Get('flashcards')
  @ApiOperation({ summary: 'Flashcards for a chosen mode (UC10)' })
  flashcards(
    @CurrentUser('userId') userId: string,
    @Query() query: FlashcardsDto,
  ) {
    return this.reviewService.flashcards(
      userId,
      query.mode,
      query.limit,
      query.scope,
    );
  }
}
