import { OpenAIClient } from './openai.client';

const mockCreate = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}));

describe('OpenAIClient', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns parsed fields and usage on success', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              date: '2026-04-12',
              cost: '185.00',
              workshopName: 'Mah Pte Ltd',
              parts: ['Engine oil', 'Oil filter'],
              description: 'Oil and filter change.',
              serviceType: 'oil_change',
              confidence: 0.88,
            }),
          },
        },
      ],
      usage: { prompt_tokens: 1000, completion_tokens: 100 },
    });

    const client = new OpenAIClient('fake-key', 'gpt-4o-mini');
    const result = await client.extractReceiptFields(
      Buffer.from('fake'),
      'image/jpeg',
    );

    expect(result.fields.cost).toBe('185.00');
    expect(result.fields.parts).toHaveLength(2);
    expect(result.usage).toEqual({ tokensIn: 1000, tokensOut: 100 });
  });

  it('throws when response is not valid JSON', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'not json' } }],
      usage: {},
    });

    const client = new OpenAIClient('fake-key', 'gpt-4o-mini');
    await expect(
      client.extractReceiptFields(Buffer.from('fake'), 'image/jpeg'),
    ).rejects.toThrow(/parse/i);
  });

  it('passes image as base64 data URL', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        { message: { content: JSON.stringify({ parts: [], confidence: 0.9 }) } },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    });

    const client = new OpenAIClient('fake-key', 'gpt-4o-mini');
    await client.extractReceiptFields(Buffer.from('xyz'), 'image/png');

    const call = mockCreate.mock.calls[0][0] as {
      messages: { content: { type: string; image_url?: { url: string } }[] }[];
    };
    const imagePart = call.messages[0].content.find(
      (p) => p.type === 'image_url',
    );
    expect(imagePart?.image_url?.url).toContain('data:image/png;base64,');
    expect(imagePart?.image_url?.url).toContain(
      Buffer.from('xyz').toString('base64'),
    );
  });
});
