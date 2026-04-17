import { Injectable } from '@nestjs/common';

export interface OcrRateLimiterConfig {
  globalRpm: number;
  perUserDailyCap: number;
}

@Injectable()
export class OcrRateLimiter {
  private timestamps: number[] = [];

  constructor(private readonly cfg: OcrRateLimiterConfig) {}

  checkGlobal(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < 60_000);
    if (this.timestamps.length >= this.cfg.globalRpm) return false;
    this.timestamps.push(now);
    return true;
  }

  /** Caller provides the count of user requests in the last 24h from the DB. */
  checkUserDaily(recentCount: number): boolean {
    return recentCount < this.cfg.perUserDailyCap;
  }
}
