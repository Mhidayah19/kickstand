import { IsString, IsUUID } from 'class-validator';

export class UpsertFromPlaceDto {
  @IsString()
  placeId: string;

  @IsUUID()
  sessionToken: string;
}
