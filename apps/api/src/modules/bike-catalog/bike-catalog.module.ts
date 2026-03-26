import { Module } from '@nestjs/common';
import { BikeCatalogController } from './bike-catalog.controller';
import { BikeCatalogService } from './bike-catalog.service';

@Module({
  controllers: [BikeCatalogController],
  providers: [BikeCatalogService],
  exports: [BikeCatalogService],
})
export class BikeCatalogModule {}
