import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateSentRecordDto {
  @IsOptional()
  @IsInt()
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}
