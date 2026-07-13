import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiThrottle } from '../common/decorators/ai-throttle.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConversationService } from './conversation.service';
import {
  ReplyConversationDto,
  StartConversationDto,
} from './dto/conversation.dto';

@ApiTags('conversation')
@ApiBearerAuth()
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('start')
  @AiThrottle()
  @ApiOperation({
    summary: 'Start a role-play; AI opens the conversation (UC12)',
  })
  start(
    @CurrentUser('userId') userId: string,
    @Body() dto: StartConversationDto,
  ) {
    return this.conversationService.start(userId, dto.scenario);
  }

  @Post(':id/reply')
  @AiThrottle()
  @ApiOperation({ summary: 'Send a turn → AI reply + feedback (UC12)' })
  reply(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: ReplyConversationDto,
  ) {
    return this.conversationService.reply(userId, id, dto.message);
  }

  @Post(':id/end')
  @AiThrottle()
  @ApiOperation({ summary: 'End the role-play and get a summary (UC12)' })
  end(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.conversationService.end(userId, id);
  }

  @Get()
  @ApiOperation({ summary: 'List past conversations' })
  list(@CurrentUser('userId') userId: string) {
    return this.conversationService.list(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation with its transcript' })
  get(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.conversationService.get(userId, id);
  }
}
