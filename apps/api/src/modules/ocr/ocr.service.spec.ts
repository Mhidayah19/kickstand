import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OcrService } from './ocr.service';
import { OpenAIClient } from './openai.client';
import { OcrRateLimiter } from './ocr-rate-limiter';
import { DRIZZLE } from '../../database/database.module';

const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
};

const mockOpenAI = { extractReceiptFields: jest.fn() };
const mockLimiter = {
  canAcceptGlobal: jest.fn(),
  consumeGlobalSlot: jest.fn(),
  canAcceptUserDaily: jest.fn(),
};
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockSelectChain(returnValue: unknown) {
  mockDb.select.mockReturnValue({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve(returnValue),
        then: (cb: any) => Promise.resolve(returnValue).then(cb),
      }),
    }),
  });
}

describe('OcrService', () => {
  let service: OcrService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OcrService,
        { provide: OpenAIClient, useValue: mockOpenAI },
        { provide: OcrRateLimiter, useValue: mockLimiter },
        { provide: DRIZZLE, useValue: mockDb },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'openai.apiKey') return 'test-key';
              if (key === 'openai.model') return 'gpt-4o-mini';
              return 0.5;
            }),
          },
        },
      ],
    }).compile();
    service = module.get(OcrService);

    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      headers: new Map([['content-type', 'image/jpeg']]),
    } as any);
    mockLimiter.canAcceptGlobal.mockReturnValue(true);
    mockLimiter.canAcceptUserDaily.mockReturnValue(true);
  });

  it('returns cached fields on hash hit without calling OpenAI', async () => {
    mockSelectChain([
      { fields: { confidence: 0.9, parts: [] }, receiptUrl: 'https://x/abc' },
    ]);
    // usage count query also returns []; but cache hit short-circuits before it
    const result = await service.extract('user-1', 'https://x/abc');
    expect(result.cacheHit).toBe(true);
    expect(mockOpenAI.extractReceiptFields).not.toHaveBeenCalled();
  });

  it('calls OpenAI on cache miss, caches result, logs usage', async () => {
    // cache-miss: select returns []; then usage-count select returns [{count: 0}]
    mockDb.select
      .mockReturnValueOnce({
        from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }),
      }) // cache
      .mockReturnValueOnce({
        from: () => ({ where: () => Promise.resolve([{ count: 0 }]) }),
      }) // usage count
      .mockReturnValueOnce({ from: () => Promise.resolve([]) }); // workshops

    mockDb.insert.mockReturnValue({ values: () => Promise.resolve(undefined) });

    mockOpenAI.extractReceiptFields.mockResolvedValue({
      fields: {
        date: '2026-04-12',
        cost: '185.00',
        workshopName: 'X',
        parts: [],
        description: null,
        serviceType: null,
        confidence: 0.9,
      },
      usage: { tokensIn: 100, tokensOut: 50 },
    });

    const result = await service.extract('user-1', 'https://x/abc');
    expect(result.cacheHit).toBe(false);
    expect(result.fields.cost).toBe('185.00');
    expect(mockDb.insert).toHaveBeenCalledTimes(2); // cache + usage_log
  });

  it('throws 429 when global RPM exceeded', async () => {
    mockLimiter.canAcceptGlobal.mockReturnValue(false);
    await expect(
      service.extract('user-1', 'https://x/abc'),
    ).rejects.toMatchObject({ status: 429 });
  });

  it('throws 429 when user daily cap exceeded', async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }),
      })
      .mockReturnValueOnce({
        from: () => ({ where: () => Promise.resolve([{ count: 999 }]) }),
      });
    mockLimiter.canAcceptUserDaily.mockReturnValue(false);

    await expect(
      service.extract('user-1', 'https://x/abc'),
    ).rejects.toMatchObject({ status: 429 });
  });

  it('throws 422 when confidence below floor', async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }),
      })
      .mockReturnValueOnce({
        from: () => ({ where: () => Promise.resolve([{ count: 0 }]) }),
      });
    mockDb.insert.mockReturnValue({ values: () => Promise.resolve(undefined) });
    mockOpenAI.extractReceiptFields.mockResolvedValue({
      fields: {
        date: null,
        cost: null,
        workshopName: null,
        parts: [],
        description: null,
        serviceType: null,
        confidence: 0.2,
      },
      usage: { tokensIn: 10, tokensOut: 5 },
    });

    await expect(
      service.extract('user-1', 'https://x/abc'),
    ).rejects.toMatchObject({ status: 422 });
  });
});
