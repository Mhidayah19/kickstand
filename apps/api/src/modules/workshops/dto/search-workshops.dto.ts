import { IsString, IsOptional, IsNumberString, IsUUID } from 'class-validator';

export class SearchWorkshopsDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsNumberString()
  lat?: string;

  @IsOptional()
  @IsNumberString()
  lng?: string;

  @IsUUID()
  sessionToken: string;
}
