import { IsIn, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { SERVICE_TYPE_KEYS } from '../../../common/constants/service-types';

export class CompareWorkshopsDto {
  @IsNotEmpty()
  @IsIn(SERVICE_TYPE_KEYS)
  service_type: string;

  @IsOptional()
  @IsString()
  bike_model?: string;
}
