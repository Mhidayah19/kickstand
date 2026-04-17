import OpenAI from 'openai';
import { OCR_PROMPT } from './prompt';
import { OcrExtractedFields } from './dto/ocr-response.dto';

export interface OpenAIUsage {
  tokensIn: number;
  tokensOut: number;
}

export interface OpenAIExtractResult {
  fields: OcrExtractedFields;
  usage: OpenAIUsage;
}

export class OpenAIClient {
  private readonly client: OpenAI;
  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async extractReceiptFields(
    image: Buffer,
    mimeType: string,
  ): Promise<OpenAIExtractResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: OCR_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${image.toString('base64')}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    let fields: OcrExtractedFields;
    try {
      fields = JSON.parse(text) as OcrExtractedFields;
    } catch (err) {
      throw new Error(
        `Failed to parse OpenAI response as JSON: ${(err as Error).message}`,
      );
    }

    return {
      fields,
      usage: {
        tokensIn: response.usage?.prompt_tokens ?? 0,
        tokensOut: response.usage?.completion_tokens ?? 0,
      },
    };
  }
}
