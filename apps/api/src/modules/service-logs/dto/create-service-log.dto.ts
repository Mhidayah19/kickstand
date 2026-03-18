import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumberString,
  IsIn,
  Min,
} from 'class-validator';
import { SERVICE_TYPE_KEYS } from '../../../common/constants/service-types';

export class CreateServiceLogDto {
  @IsIn(SERVICE_TYPE_KEYS)
  serviceType: string;

  @IsString()
  description: string;

  @IsNumberString()
  cost: string;

  @IsInt()
  @Min(0)
  mileageAt: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsUUID()
  workshopId?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
