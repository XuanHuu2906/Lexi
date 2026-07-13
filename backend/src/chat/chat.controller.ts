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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import {
  CreateChatThreadDto,
  ListChatThreadsDto,
  UpdateChatThreadDto,
} from './dto/chat.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat/threads')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'List saved Ask Lexi / Grammar Q&A chat threads' })
  list(
    @CurrentUser('userId') userId: string,
    @Query() query: ListChatThreadsDto,
  ) {
    return this.chatService.list(userId, query.kind);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one chat thread with its transcript' })
  get(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.chatService.get(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Save a new chat thread (first exchange)' })
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateChatThreadDto,
  ) {
    return this.chatService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a chat thread transcript after a new turn' })
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateChatThreadDto,
  ) {
    return this.chatService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved chat thread' })
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.chatService.remove(userId, id);
  }
}
