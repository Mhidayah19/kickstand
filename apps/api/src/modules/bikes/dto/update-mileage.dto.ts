import { IsInt, Min } from 'class-validator';

export class UpdateMileageDto {
  @IsInt()
  @Min(0)
  currentMileage: number;
}
