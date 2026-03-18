import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { ServiceLogsService } from './service-logs.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { ListServiceLogsDto } from './dto/list-service-logs.dto';

@Controller('bikes/:bikeId/services')
@UseGuards(SupabaseAuthGuard)
export class ServiceLogsController {
  constructor(private serviceLogsService: ServiceLogsService) {}

  @Get()
  findAll(
    @Param('bikeId') bikeId: string,
    @CurrentUser() user: AuthUser,
    @Query() query: ListServiceLogsDto,
  ) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(query.limit ?? '20', 10) || 20),
    );
    return this.serviceLogsService.findAllByBike(bikeId, user.id, page, limit);
  }

  @Post()
  create(
    @Param('bikeId') bikeId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateServiceLogDto,
  ) {
    return this.serviceLogsService.create(bikeId, user.id, dto);
  }

  @Delete(':id')
  remove(
    @Param('bikeId') bikeId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.serviceLogsService.remove(id, bikeId, user.id);
  }
}
