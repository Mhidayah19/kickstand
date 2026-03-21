import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './database/database.module';
import { envConfig } from './config/env.config';
import { HealthController } from './health.controller';
import { BikesModule } from './modules/bikes/bikes.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { ServiceLogsModule } from './modules/service-logs/service-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProd ? 'info' : 'debug',
        redact: ['req.headers.authorization'],
        ...(isProd
          ? {}
          : {
              transport: {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              },
            }),
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            params: req.params,
          }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
        autoLogging: {
          ignore: (req) => req.url === '/health',
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    ScheduleModule.forRoot(),
    TerminusModule,
    DatabaseModule,
    BikesModule,
    AuthModule,
    WorkshopsModule,
    ServiceLogsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
