import { IsString, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateRecordDto {
  @IsInt()
  amount!: number;

  @IsOptional()
  @IsString()
  giftType?: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsString()
  eventId!: string;

  /** 단일 등록 */
  @IsOptional()
  @IsString()
  friendId?: string;

  /** 1:N 일괄 등록 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  friendIds?: string[];
}
