import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { FindWorkshopsDto } from './dto/find-workshops.dto';
import { CompareWorkshopsDto } from './dto/compare-workshops.dto';

@Controller('workshops')
export class WorkshopsController {
  constructor(private workshopsService: WorkshopsService) {}

  @Get()
  findAll(@Query() query: FindWorkshopsDto) {
    return this.workshopsService.findNearby(query);
  }

  @Get('compare')
  compare(@Query() query: CompareWorkshopsDto) {
    return this.workshopsService.compareByService(
      query.service_type,
      query.bike_model,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }
}
