import { IsString, IsInt, IsOptional, IsDateString, IsUUID, IsNumberString, Min } from 'class-validator';

export class CreateServiceLogDto {
  @IsString()
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
