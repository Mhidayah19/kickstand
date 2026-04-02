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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { ServiceLogsService } from './service-logs.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';
import { ListServiceLogsDto } from './dto/list-service-logs.dto';

@Controller('bikes/:bikeId/services')
export class ServiceLogsController {
  constructor(private serviceLogsService: ServiceLogsService) {}

  @Get()
  findAll(
    @Param('bikeId') bikeId: string,
    @CurrentUser() user: AuthUser,
    @Query() query: ListServiceLogsDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.serviceLogsService.findAllByBike(bikeId, user.id, page, limit);
  }

  @Get(':id')
  findOne(
    @Param('bikeId') bikeId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.serviceLogsService.findOne(id, bikeId, user.id);
  }

  @Post()
  create(
    @Param('bikeId') bikeId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateServiceLogDto,
  ) {
    return this.serviceLogsService.create(bikeId, user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('bikeId') bikeId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateServiceLogDto,
  ) {
    return this.serviceLogsService.update(id, bikeId, user.id, dto);
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
