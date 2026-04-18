import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;
}
