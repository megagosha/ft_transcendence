import { GameStatistic } from '../../game/gamestats.entity';
import { Friendship } from '../friendlist.entity';
import { User, UserStatus } from '../user.entity';
import { renderPath, rootPath } from '../../constants';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

export class UserProfileDto {
  constructor(user: User) {
    Logger.log(user.username);
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.registerDate = user.registerDate;
    this.lastLoginDate = user.lastLoginDate;
    this.status = user.status;
    this.statistic = user.statistic;
    this.invitedFriendships = user.invitedFriendships;
    this.invitorFriendships = user.invitorFriendships;
    try {
      Logger.log('res ' + `/${user.id}/${user.id}.png`);
      if (fs.existsSync(`${rootPath}${user.id}/${user.id}.png`)) {
        this.avatarImgName = `/${user.id}/${user.id}.png`;
      } else this.avatarImgName = `/default.png`;
    } catch (err) {
      this.avatarImgName = `/default.png`;
    }
    Logger.log(`${user.id}/${user.id}.png`);
  }
  id: number;
  username: string;
  email: string;
  registerDate: Date;
  lastLoginDate: Date;
  status: UserStatus;
  avatarImgName: string;
  statistic: GameStatistic = new GameStatistic();
  invitorFriendships: Friendship[];
  invitedFriendships: Friendship[];
}
