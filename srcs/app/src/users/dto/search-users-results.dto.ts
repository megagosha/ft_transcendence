import { User } from '../user.entity';
import { UserService } from '../user.service';
import { Logger } from '@nestjs/common';
import {UsersServiceSupport} from "../users.service-support";

export class SearchUsersResultsDto {
  id: number;
  username: string;
  avatarImgName: string;
  status: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.status = user.status;
    this.avatarImgName = UsersServiceSupport.getUserAvatarPath(user);
    //UsersServiceSupport.getUserAvatarPath(user);
  }
}
