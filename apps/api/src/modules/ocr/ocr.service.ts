import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, gte, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import { aiUsageLogs, ocrCache, workshops } from '../../database/schema';
import { OpenAIClient } from './openai.client';
import { OcrRateLimiter } from './ocr-rate-limiter';
import { matchWorkshop } from './workshop-matcher';
import { sha256OfBytes } from './image-hash';
import { OcrResponse } from './dto/ocr-response.dto';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly openai: OpenAIClient,
    private readonly limiter: OcrRateLimiter,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('openai.apiKey');
    const model = this.config.get<string>('openai.model');
    this.logger.log(
      `OpenAI config — model: ${model}, apiKey: ${apiKey ? `${apiKey.slice(0, 6)}…` : 'MISSING'}`,
    );
  }

  async extract(userId: string, receiptUrl: string): Promise<OcrResponse> {
    this.logger.log(`OCR request — userId: ${userId}, url: ${receiptUrl}`);

    if (!this.limiter.canAcceptGlobal()) {
      this.logger.warn('OCR blocked — global RPM exceeded');
      throw new HttpException(
        'OCR busy — please retry in a moment',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.limiter.consumeGlobalSlot();

    this.logger.log('Fetching receipt image…');
    const res = await fetch(receiptUrl);
    if (!res.ok)
      throw new HttpException(
        'Unable to fetch receipt',
        HttpStatus.BAD_REQUEST,
      );
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      throw new HttpException(
        'Receipt URL did not return an image',
        HttpStatus.BAD_REQUEST,
      );
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    const imageHash = sha256OfBytes(bytes);
    this.logger.log(
      `Image fetched — ${bytes.length} bytes, mimeType: ${mimeType}, hash: ${imageHash.slice(0, 12)}…`,
    );

    const cached = await this.db
      .select()
      .from(ocrCache)
      .where(
        and(eq(ocrCache.userId, userId), eq(ocrCache.imageHash, imageHash)),
      )
      .limit(1);
    if (cached.length > 0) {
      this.logger.log('Cache hit — returning cached OCR result');
      const workshopId = await this.resolveWorkshop(
        (cached[0].fields as OcrResponse['fields']).workshopName,
      );
      return {
        fields: cached[0].fields as OcrResponse['fields'],
        workshopId,
        receiptUrl: cached[0].receiptUrl,
        cacheHit: true,
      };
    }

    this.logger.log('Cache miss — calling OpenAI');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const countRow = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiUsageLogs)
      .where(
        and(eq(aiUsageLogs.userId, userId), gte(aiUsageLogs.createdAt, since)),
      );
    const dailyCount = Number(countRow[0]?.count ?? 0);
    this.logger.log(`User daily usage: ${dailyCount}`);
    if (!this.limiter.canAcceptUserDaily(dailyCount)) {
      this.logger.warn(`OCR blocked — user ${userId} hit daily cap`);
      throw new HttpException(
        'Daily OCR limit reached — try again tomorrow',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.logger.log('Sending image to OpenAI…');
    const { fields, usage } = await this.openai.extractReceiptFields(
      bytes,
      mimeType,
    );
    this.logger.log(
      `OpenAI responded — confidence: ${fields.confidence}, tokensIn: ${usage.tokensIn}, tokensOut: ${usage.tokensOut}`,
    );
    const floor = this.config.get<number>('openai.confidenceFloor') ?? 0.5;

    await this.db.insert(aiUsageLogs).values({
      userId,
      model: this.config.get<string>('openai.model') ?? 'gpt-4o-mini',
      tokensIn: usage.tokensIn,
      tokensOut: usage.tokensOut,
    });

    if ((fields.confidence ?? 0) < floor) {
      this.logger.warn(
        `Low confidence (${fields.confidence} < ${floor}) — rejecting`,
      );
      throw new HttpException(
        'low_confidence',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    await this.db.insert(ocrCache).values({
      userId,
      imageHash,
      fields: fields as any,
      receiptUrl,
    });

    const workshopId = await this.resolveWorkshop(fields.workshopName);
    this.logger.log(
      `OCR complete — workshopId: ${workshopId ?? 'none'}, cacheHit: false`,
    );

    return { fields, workshopId, receiptUrl, cacheHit: false };
  }

  private async resolveWorkshop(
    extractedName: string | null,
  ): Promise<string | null> {
    if (!extractedName) return null;
    const list = await this.db
      .select({ id: workshops.id, name: workshops.name })
      .from(workshops);
    return matchWorkshop(extractedName, list).workshopId;
  }
}
