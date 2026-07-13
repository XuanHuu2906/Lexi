import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  controllers: [ReviewController, QuizController],
  providers: [ReviewService, QuizService],
  exports: [ReviewService, QuizService],
})
export class ReviewModule {}
