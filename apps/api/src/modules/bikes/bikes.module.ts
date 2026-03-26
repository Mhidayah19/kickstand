import { Module } from '@nestjs/common';
import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';
import { BikeCatalogModule } from '../bike-catalog/bike-catalog.module';

@Module({
  imports: [BikeCatalogModule],
  controllers: [BikesController],
  providers: [BikesService],
  exports: [BikesService],
})
export class BikesModule {}
