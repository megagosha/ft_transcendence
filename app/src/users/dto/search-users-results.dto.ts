import { User } from '../user.entity';
import { UserService } from '../user.service';
import { Logger } from '@nestjs/common';

export class SearchUsersResultsDto {
  id: number;
  username: string;
  avatarImgName: string;
  status: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.status = user.status;
    this.avatarImgName = UserService.getAvatarUrlById(this.id);
  }
}
