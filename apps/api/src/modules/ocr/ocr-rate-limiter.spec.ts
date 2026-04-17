import { OcrRateLimiter } from './ocr-rate-limiter';

describe('OcrRateLimiter', () => {
  it('allows acceptance under the global RPM', () => {
    const limiter = new OcrRateLimiter({ globalRpm: 2, perUserDailyCap: 10 });
    expect(limiter.canAcceptGlobal()).toBe(true);
    limiter.consumeGlobalSlot();
    expect(limiter.canAcceptGlobal()).toBe(true);
    limiter.consumeGlobalSlot();
  });

  it('rejects acceptance above the global RPM within a minute', () => {
    const limiter = new OcrRateLimiter({ globalRpm: 2, perUserDailyCap: 10 });
    limiter.consumeGlobalSlot();
    limiter.consumeGlobalSlot();
    expect(limiter.canAcceptGlobal()).toBe(false);
  });

  it('canAcceptGlobal does not mutate state (query purity)', () => {
    const limiter = new OcrRateLimiter({ globalRpm: 1, perUserDailyCap: 10 });
    expect(limiter.canAcceptGlobal()).toBe(true);
    expect(limiter.canAcceptGlobal()).toBe(true);
    expect(limiter.canAcceptGlobal()).toBe(true);
  });

  it('releases slots after the window expires', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-17T00:00:00Z'));
    const limiter = new OcrRateLimiter({ globalRpm: 1, perUserDailyCap: 10 });
    expect(limiter.canAcceptGlobal()).toBe(true);
    limiter.consumeGlobalSlot();
    expect(limiter.canAcceptGlobal()).toBe(false);
    jest.setSystemTime(new Date('2026-04-17T00:01:01Z'));
    expect(limiter.canAcceptGlobal()).toBe(true);
    jest.useRealTimers();
  });

  it('counts per-user daily usage from a recent-requests count', () => {
    const limiter = new OcrRateLimiter({ globalRpm: 100, perUserDailyCap: 3 });
    expect(limiter.canAcceptUserDaily(2)).toBe(true);
    expect(limiter.canAcceptUserDaily(3)).toBe(false);
  });
});
