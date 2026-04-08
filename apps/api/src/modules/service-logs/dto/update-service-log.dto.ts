import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumberString,
  IsIn,
  IsArray,
  ArrayMaxSize,
  Min,
} from 'class-validator';
import { SERVICE_TYPE_KEYS } from '../../../common/constants/service-types';

export class UpdateServiceLogDto {
  @IsOptional()
  @IsIn(SERVICE_TYPE_KEYS)
  serviceType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumberString()
  cost?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileageAt?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parts?: string[];

  @IsOptional()
  @IsUUID()
  workshopId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  receiptUrls?: string[];
}
