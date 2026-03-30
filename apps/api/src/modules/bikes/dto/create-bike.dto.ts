import {
  IsString,
  IsInt,
  IsIn,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateBikeDto {
  @IsString()
  model: string;

  @IsInt()
  @Min(1970)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  plateNumber: string;

  @IsIn(['2B', '2A', '2'])
  class: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentMileage?: number;

  @IsOptional()
  @IsDateString()
  coeExpiry?: string;

  @IsOptional()
  @IsDateString()
  roadTaxExpiry?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  inspectionDue?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  engineCc?: number;

  @IsOptional()
  @IsString()
  bikeType?: string;

  @IsOptional()
  @IsUUID()
  catalogId?: string;
}
