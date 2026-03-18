import { IsString, IsOptional } from 'class-validator';

export class CompareWorkshopsDto {
  @IsString()
  service_type: string;

  @IsOptional()
  @IsString()
  bike_model?: string;
}
