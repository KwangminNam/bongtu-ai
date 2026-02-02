import { IsString } from 'class-validator';

export class CreateFriendDto {
  @IsString()
  name!: string;

  @IsString()
  relation!: string;
}
