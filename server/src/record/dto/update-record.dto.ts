import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateRecordDto {
  @IsOptional()
  @IsInt()
  amount?: number;

  @IsOptional()
  @IsString()
  memo?: string;
}
