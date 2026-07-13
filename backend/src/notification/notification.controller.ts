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
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Public VAPID key for the browser to subscribe' })
  vapidPublicKey() {
    return this.notifications.vapidPublicKey();
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Register a Web Push subscription (UC18)' })
  subscribe(@CurrentUser('userId') userId: string, @Body() dto: SubscribeDto) {
    return this.notifications.subscribe(userId, dto);
  }

  @Delete('subscribe')
  @ApiOperation({ summary: 'Remove a Web Push subscription' })
  unsubscribe(
    @CurrentUser('userId') userId: string,
    @Body() dto: UnsubscribeDto,
  ) {
    return this.notifications.unsubscribe(userId, dto.endpoint);
  }

  @Get()
  @ApiOperation({ summary: 'In-app notification centre (UC18)' })
  list(
    @CurrentUser('userId') userId: string,
    @Query() query: ListNotificationsDto,
  ) {
    return this.notifications.list(userId, query);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser('userId') userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  markRead(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.notifications.markRead(userId, id);
  }
}
