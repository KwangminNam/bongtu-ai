import { IsString, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsString()
  type!: string; // WEDDING, FUNERAL, BIRTHDAY, ETC

  @IsDateString()
  date!: string;
}
