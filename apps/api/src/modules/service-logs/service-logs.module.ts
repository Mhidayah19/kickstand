import { Module } from '@nestjs/common';
import { BikesModule } from '../bikes/bikes.module';
import { ServiceLogsController } from './service-logs.controller';
import { ServiceLogsService } from './service-logs.service';

@Module({
  imports: [BikesModule],
  controllers: [ServiceLogsController],
  providers: [ServiceLogsService],
  exports: [ServiceLogsService],
})
export class ServiceLogsModule {}
