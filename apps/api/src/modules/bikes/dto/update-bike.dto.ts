import {
  IsString,
  IsInt,
  IsIn,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateBikeDto {
  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1970)
  year?: number;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsIn(['2B', '2A', '2'])
  class?: string;

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
