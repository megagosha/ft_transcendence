import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AddFriendDto {
  @IsInt()
  @Type(() => Number)
  friend_id: number;
}
