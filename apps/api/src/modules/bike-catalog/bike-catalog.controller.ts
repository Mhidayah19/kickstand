import { Controller, Get, Param, Query } from '@nestjs/common';
import { BikeCatalogService } from './bike-catalog.service';
import { GetModelsQueryDto } from './dto/get-models-query.dto';

@Controller('bike-catalog')
export class BikeCatalogController {
  constructor(private readonly bikeCatalogService: BikeCatalogService) {}

  @Get('makes')
  getMakes() {
    return this.bikeCatalogService.findAllMakes();
  }

  @Get('models')
  getModels(@Query() query: GetModelsQueryDto) {
    return this.bikeCatalogService.findModelsByMake(query.make);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.bikeCatalogService.findOneById(id);
  }
}
