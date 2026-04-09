import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ComplianceStatusService } from './compliance-status.service';

@Module({
  imports: [DatabaseModule],
  providers: [ComplianceStatusService],
  exports: [ComplianceStatusService],
})
export class ComplianceStatusModule {}
