import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OpenAIClient } from './openai.client';
import { OcrRateLimiter } from './ocr-rate-limiter';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [OcrController],
  providers: [
    OcrService,
    {
      provide: OpenAIClient,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new OpenAIClient(
          cfg.get<string>('openai.apiKey') ?? '',
          cfg.get<string>('openai.model') ?? 'gpt-4o-mini',
        ),
    },
    {
      provide: OcrRateLimiter,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new OcrRateLimiter({
          globalRpm: cfg.get<number>('openai.globalRpm') ?? 10,
          perUserDailyCap: cfg.get<number>('openai.perUserDailyCap') ?? 50,
        }),
    },
  ],
})
export class OcrModule {}
