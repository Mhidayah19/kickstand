import { IsNotEmpty, IsString } from 'class-validator';

export class GetModelsQueryDto {
  @IsString()
  @IsNotEmpty()
  make: string;
}
