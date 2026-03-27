import { Module } from '@nestjs/common';
import { BikesModule } from '../bikes/bikes.module';
import { ServiceLogsController } from './service-logs.controller';
import { UserServiceLogsController } from './service-logs-user.controller';
import { ServiceLogsService } from './service-logs.service';

@Module({
  imports: [BikesModule],
  controllers: [ServiceLogsController, UserServiceLogsController],
  providers: [ServiceLogsService],
  exports: [ServiceLogsService],
})
export class ServiceLogsModule {}
