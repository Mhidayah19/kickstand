import { IsUrl } from 'class-validator';

export class OcrRequestDto {
  @IsUrl({ require_tld: false, require_protocol: true })
  receiptUrl: string;
}
