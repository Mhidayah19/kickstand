import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^ExponentPushToken\[.+\]$/)
  expoToken: string;
}
