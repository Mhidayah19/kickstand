import { Module } from '@nestjs/common';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';
import { PlacesClient } from './places/places.client';

@Module({
  controllers: [WorkshopsController],
  providers: [WorkshopsService, PlacesClient],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
