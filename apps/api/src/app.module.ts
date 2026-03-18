import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from './database/database.module';
import { envConfig } from './config/env.config';
import { HealthController } from './health.controller';
import { BikesModule } from './modules/bikes/bikes.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkshopsModule } from './modules/workshops/workshops.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    TerminusModule,
    DatabaseModule,
    BikesModule,
    AuthModule,
    WorkshopsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
