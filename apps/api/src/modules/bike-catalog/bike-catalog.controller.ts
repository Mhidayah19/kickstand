import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { BikeCatalogService } from './bike-catalog.service';

@Controller('bike-catalog')
export class BikeCatalogController {
  constructor(private readonly bikeCatalogService: BikeCatalogService) {}

  @Get('makes')
  getMakes() {
    return this.bikeCatalogService.findAllMakes();
  }

  @Get('models')
  getModels(@Query('make') make: string) {
    if (!make) {
      throw new BadRequestException('make query parameter is required');
    }
    return this.bikeCatalogService.findModelsByMake(make);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.bikeCatalogService.findOneById(id);
  }
}
