// import { GameStatistic } from '../../game/gamestats.entity';
import { Friendship } from '../friendlist.entity';
import { User, UserStatus } from '../user.entity';
import { renderPath, rootPath } from '../../constants';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { UserService } from '../user.service';
import {UsersServiceSupport} from "../users.service-support";

export class UserProfileDto {
  constructor(user: User, blocked = false) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.registerDate = user.registerDate;
    this.lastLoginDate = user.lastLoginDate;
    this.status = user.status;
    // this.statistic = user.statistic;
    this.invitedFriendships = user.invitedFriendships;
    this.invitorFriendships = user.invitorFriendships;
    this.avatarImgName = UsersServiceSupport.getUserAvatarPath(user);
    this.isTwoAuth = user.twoAuth != null;
    this.blocked = blocked;
    Logger.log('Avatar is set to ' + this.avatarImgName);
  }
  id: number;
  username: string;
  email: string;
  registerDate: Date;
  lastLoginDate: Date;
  status: UserStatus;
  avatarImgName: string;
  isTwoAuth: boolean;
  // statistic: GameStatistic = new GameStatistic();
  invitorFriendships: Friendship[];
  invitedFriendships: Friendship[];
  blocked: boolean;
}
