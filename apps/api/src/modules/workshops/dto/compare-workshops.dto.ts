import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CompareWorkshopsDto {
  @IsString()
  @IsNotEmpty()
  service_type: string;

  @IsOptional()
  @IsString()
  bike_model?: string;
}
