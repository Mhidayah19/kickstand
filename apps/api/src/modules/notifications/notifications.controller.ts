import { Controller, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { NotificationsScanService } from './notifications-scan.service';
import { RegisterTokenDto } from './dto/register-token.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsScanService: NotificationsScanService,
  ) {}

  @Post('register-token')
  @UseGuards(SupabaseAuthGuard)
  async registerToken(
    @CurrentUser() user: AuthUser,
    @Body() dto: RegisterTokenDto,
  ) {
    await this.notificationsService.registerToken(user.id, dto.expoToken);
    return { success: true };
  }

  @Post('trigger-scan')
  @UseGuards(ApiKeyGuard)
  async triggerScan(@Query('job') job?: string) {
    return this.notificationsScanService.run(job);
  }
}
