import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateSentRecordDto {
  @IsInt()
  amount!: number;

  @IsDateString()
  date!: string;

  @IsString()
  eventType!: string; // WEDDING, FUNERAL, BIRTHDAY, ETC

  @IsOptional()
  @IsString()
  memo?: string;

  @IsString()
  friendId!: string;
}
