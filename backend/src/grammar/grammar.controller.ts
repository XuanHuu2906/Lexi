import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateGrammarDto } from './dto/create-grammar.dto';
import { GenerateGrammarExamplesDto } from './dto/generate-examples.dto';
import { ListGrammarDto } from './dto/list-grammar.dto';
import { PreviewGrammarDto } from './dto/preview-grammar.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';
import { GrammarService } from './grammar.service';

@ApiTags('grammar')
@ApiBearerAuth()
@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Post('preview')
  @AiThrottle()
  @ApiOperation({
    summary:
      'Normalise a rough rule → formula + explanation + examples (UC20, no save)',
  })
  preview(@Body() dto: PreviewGrammarDto) {
    return this.grammarService.preview(dto.rule);
  }

  @Post()
  @ApiOperation({ summary: 'Save a grammar rule to the library' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateGrammarDto) {
    return this.grammarService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List grammar rules with search + pagination' })
  list(@CurrentUser('userId') userId: string, @Query() query: ListGrammarDto) {
    return this.grammarService.list(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one grammar rule' })
  getOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.grammarService.getOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a grammar rule' })
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGrammarDto,
  ) {
    return this.grammarService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grammar rule' })
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.grammarService.remove(userId, id);
  }

  @Post(':id/examples')
  @AiThrottle()
  @ApiOperation({
    summary: 'Generate more examples for a rule and append them',
  })
  generateExamples(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: GenerateGrammarExamplesDto,
  ) {
    return this.grammarService.generateExamples(userId, id, dto);
  }
}
