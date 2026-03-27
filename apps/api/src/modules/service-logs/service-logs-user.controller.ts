import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { ServiceLogsService } from './service-logs.service';
import { ListServiceLogsDto } from './dto/list-service-logs.dto';

@Controller('service-logs')
@UseGuards(SupabaseAuthGuard)
export class UserServiceLogsController {
  constructor(private serviceLogsService: ServiceLogsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListServiceLogsDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.serviceLogsService.findAllByUser(user.id, page, limit);
  }
}
