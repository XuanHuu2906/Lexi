import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/jwt-payload.type';
import { AdminWordsService } from './admin-words.service';
import { auditActor as actor } from './audit.service';
import {
  CreateAdminWordDto,
  ImportWordsDto,
  ListAdminWordsDto,
  UpdateAdminWordDto,
} from './dto/word.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('admin/words')
export class AdminWordsController {
  constructor(private readonly words: AdminWordsService) {}

  @Get()
  @ApiOperation({ summary: 'List TOEIC word list with search/filter (UCA03)' })
  list(@Query() query: ListAdminWordsDto) {
    return this.words.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Add a word to the TOEIC list' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAdminWordDto) {
    return this.words.create(actor(user), dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Bulk-import words from CSV (preview + commit)' })
  import(@CurrentUser() user: AuthUser, @Body() dto: ImportWordsDto) {
    return this.words.import(actor(user), dto);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export the whole list as CSV text' })
  export(@CurrentUser() user: AuthUser) {
    return this.words.export(actor(user));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a word' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdminWordDto,
  ) {
    return this.words.update(actor(user), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a word from the list' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.words.remove(actor(user), id);
  }
}
