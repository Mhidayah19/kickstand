import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { FindWorkshopsDto } from './dto/find-workshops.dto';
import { CompareWorkshopsDto } from './dto/compare-workshops.dto';
import { SearchWorkshopsDto } from './dto/search-workshops.dto';
import { UpsertFromPlaceDto } from './dto/upsert-from-place.dto';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('workshops')
@UseGuards(SupabaseAuthGuard)
export class WorkshopsController {
  constructor(private workshopsService: WorkshopsService) {}

  @Get()
  findAll(@Query() query: FindWorkshopsDto) {
    return this.workshopsService.findNearby(query);
  }

  @Get('search')
  search(@Query() query: SearchWorkshopsDto) {
    return this.workshopsService.searchPlaces({
      query: query.q,
      lat: query.lat != null ? parseFloat(query.lat) : undefined,
      lng: query.lng != null ? parseFloat(query.lng) : undefined,
      sessionToken: query.sessionToken,
    });
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.workshopsService.findMine(user.id);
  }

  @Get('compare')
  compare(@Query() query: CompareWorkshopsDto) {
    return this.workshopsService.compareByService(
      query.service_type,
      query.bike_model,
    );
  }

  @Post()
  createManual(@Body() body: CreateWorkshopDto) {
    return this.workshopsService.createManual(body);
  }

  @Post('upsert-from-place')
  upsertFromPlace(@Body() body: UpsertFromPlaceDto) {
    return this.workshopsService.upsertFromPlace(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }
}
