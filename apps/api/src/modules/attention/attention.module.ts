import { Module } from '@nestjs/common';
import { BikesModule } from '../bikes/bikes.module';
import { MaintenanceStatusModule } from '../maintenance-status/maintenance-status.module';
import { ComplianceStatusModule } from '../compliance-status/compliance-status.module';
import { AttentionController } from './attention.controller';
import { AttentionService } from './attention.service';

@Module({
  imports: [BikesModule, MaintenanceStatusModule, ComplianceStatusModule],
  controllers: [AttentionController],
  providers: [AttentionService],
})
export class AttentionModule {}
