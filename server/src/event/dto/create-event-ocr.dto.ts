import { IsString, IsDateString, IsArray, ValidateNested, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OcrRecordDto {
  @IsString()
  name!: string;

  @IsInt()
  amount!: number;

  @IsOptional()
  @IsString()
  relation?: string;
}

export class CreateEventOcrDto {
  @IsString()
  title!: string;

  @IsString()
  type!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OcrRecordDto)
  records!: OcrRecordDto[];
}
