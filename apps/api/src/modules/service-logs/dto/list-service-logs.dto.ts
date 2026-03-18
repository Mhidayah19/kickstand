import { IsOptional, IsNumberString } from 'class-validator';

export class ListServiceLogsDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
