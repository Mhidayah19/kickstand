import { IsOptional, IsNumberString, ValidateIf } from 'class-validator';

export class FindWorkshopsDto {
  @ValidateIf((o: FindWorkshopsDto) => o.lng !== undefined)
  @IsNumberString()
  lat?: string;

  @ValidateIf((o: FindWorkshopsDto) => o.lat !== undefined)
  @IsNumberString()
  lng?: string;

  @IsOptional()
  @IsNumberString()
  radius?: string; // km, defaults to 10
}
