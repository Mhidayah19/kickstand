import { IsOptional, IsNumberString } from 'class-validator';

export class FindWorkshopsDto {
  @IsOptional()
  @IsNumberString()
  lat?: string;

  @IsOptional()
  @IsNumberString()
  lng?: string;

  @IsOptional()
  @IsNumberString()
  radius?: string; // km, defaults to 10
}
