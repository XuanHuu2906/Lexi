import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateWordDto } from './dto/create-word.dto';
import { GenerateExamplesDto } from './dto/generate-examples.dto';
import { ListWordsDto } from './dto/list-words.dto';
import { LookupBatchDto } from './dto/lookup-batch.dto';
import { LookupDto } from './dto/lookup.dto';
import { QuickAddDto } from './dto/quick-add.dto';
import { VerifyWordDto } from './dto/verify-word.dto';
import { WordsService } from './words.service';

@ApiTags('words')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  // UC04 — public so guests can try it, but rate-limited (15 lookups / minute / IP).
  @Public()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('lookup')
  @ApiOperation({
    summary: 'Look up & explain a word (guest-accessible, rate-limited)',
  })
  lookup(@Body() dto: LookupDto) {
    return this.wordsService.lookup(dto);
  }

  // UC04 (multi) — one paste, many word cards. Each word is an AI call, so cap
  // requests tighter than the single lookup (parser also caps words per paste).
  @Public()
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @Post('lookup-batch')
  @ApiOperation({
    summary: 'Look up several words at once from pasted text (rate-limited)',
  })
  lookupBatch(@Body() dto: LookupBatchDto) {
    return this.wordsService.lookupBatch(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a word to the notebook (UC06)' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateWordDto) {
    return this.wordsService.create(userId, dto);
  }

  @Post('verify')
  @AiThrottle()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate a vocab entry & enrich it like a lookup (UC21, no save)',
  })
  verify(@Body() dto: VerifyWordDto) {
    return this.wordsService.verify(dto);
  }

  @Post('quick-add')
  @AiThrottle()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Quick-add "term: meaning" + TOEIC synonyms (UC21)',
  })
  quickAdd(@CurrentUser('userId') userId: string, @Body() dto: QuickAddDto) {
    return this.wordsService.quickAdd(userId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List saved words with filters + pagination' })
  list(@CurrentUser('userId') userId: string, @Query() query: ListWordsDto) {
    return this.wordsService.list(userId, query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get one saved word' })
  getOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.wordsService.getOne(userId, id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a saved word' })
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.wordsService.remove(userId, id);
  }

  @Post(':id/examples')
  @AiThrottle()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate personalised examples for a word (UC08)' })
  generateExamples(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: GenerateExamplesDto,
  ) {
    return this.wordsService.generateExamples(userId, id, dto);
  }
}
