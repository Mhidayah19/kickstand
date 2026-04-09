// apps/api/src/modules/maintenance-status/maintenance-status.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MaintenanceStatusService } from './maintenance-status.service';

@Module({
  imports: [DatabaseModule],
  providers: [MaintenanceStatusService],
  exports: [MaintenanceStatusService],
})
export class MaintenanceStatusModule {}
