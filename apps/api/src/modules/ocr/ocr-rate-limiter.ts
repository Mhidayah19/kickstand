import { Injectable } from '@nestjs/common';

export interface OcrRateLimiterConfig {
  globalRpm: number;
  perUserDailyCap: number;
}

@Injectable()
export class OcrRateLimiter {
  private timestamps: number[] = [];

  constructor(private readonly cfg: OcrRateLimiterConfig) {}

  canAcceptGlobal(): boolean {
    const now = Date.now();
    const active = this.timestamps.filter((t) => now - t < 60_000);
    return active.length < this.cfg.globalRpm;
  }

  consumeGlobalSlot(): void {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < 60_000);
    this.timestamps.push(now);
  }

  canAcceptUserDaily(recentCount: number): boolean {
    return recentCount < this.cfg.perUserDailyCap;
  }
}
