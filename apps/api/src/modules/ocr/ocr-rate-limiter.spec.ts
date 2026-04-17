import { OcrRateLimiter } from './ocr-rate-limiter';

describe('OcrRateLimiter', () => {
  it('allows requests under the global RPM', () => {
    const limiter = new OcrRateLimiter({ globalRpm: 2, perUserDailyCap: 10 });
    expect(limiter.checkGlobal()).toBe(true);
    expect(limiter.checkGlobal()).toBe(true);
  });

  it('blocks requests above the global RPM within a minute', () => {
    const limiter = new OcrRateLimiter({ globalRpm: 2, perUserDailyCap: 10 });
    limiter.checkGlobal();
    limiter.checkGlobal();
    expect(limiter.checkGlobal()).toBe(false);
  });

  it('releases slots after the window expires', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-17T00:00:00Z'));
    const limiter = new OcrRateLimiter({ globalRpm: 1, perUserDailyCap: 10 });
    expect(limiter.checkGlobal()).toBe(true);
    expect(limiter.checkGlobal()).toBe(false);
    jest.setSystemTime(new Date('2026-04-17T00:01:01Z'));
    expect(limiter.checkGlobal()).toBe(true);
    jest.useRealTimers();
  });

  it('counts per-user daily usage from a recent-requests count', () => {
    const limiter = new OcrRateLimiter({ globalRpm: 100, perUserDailyCap: 3 });
    expect(limiter.checkUserDaily(2)).toBe(true);
    expect(limiter.checkUserDaily(3)).toBe(false);
  });
});
