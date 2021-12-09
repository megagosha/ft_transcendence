import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { GameStatistic } from '../game/gamestats.entity';
import { Friendship } from './friendlist.entity';

enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  DISABLED = 'DISABLED',
}
/** Пользователь */
@Entity({ name: 'ft_user' })
export class User {
  public static readonly USERNAME_LENGTH: number = 120;
  public static readonly PASSWORD_LENGTH: number = 65;
  public static readonly USER_STATUS_LENGTH: number = 15;
  public static readonly AVATAR_IMG_NAME_LENGTH: number = 100;

  /** Id */
  @PrimaryGeneratedColumn()
  id: number;

  /** Версия */
  @VersionColumn()
  version: number;

  /** Юзернэйм */
  @Column({ length: User.USERNAME_LENGTH, nullable: false, unique: true })
  username: string;

  /** 42 id */
  @Column({ unique: true, nullable: false })
  fortytwo_id: number;

  @Column({ unique: true, nullable: false })
  email: string;

  /** Пароль */
  @Column({ length: User.PASSWORD_LENGTH, nullable: true })
  password: string;

  /** Дата регистрации */
  @CreateDateColumn({
    nullable: false,
    update: false,
    insert: false,
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  registerDate: Date;

  /** Дата послднего логина */
  @Column({
    nullable: false,
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  lastLoginDate: Date;

  /** Статус */
  @Column({ length: User.USER_STATUS_LENGTH, nullable: false, default: 0 })
  status: UserStatus;

  /** Наименование изоброжения аватарки */
  @Column({ length: User.AVATAR_IMG_NAME_LENGTH, nullable: true })
  avatarImgName: string;

  /** Статисктика и достижения пользователя в играх */
  @OneToOne(() => GameStatistic, { nullable: false })
  @JoinColumn({ name: 'game_statistic_id', referencedColumnName: 'id' })
  statistic: GameStatistic = new GameStatistic();

  /** Дружбы, в которых пользователь является инициатором */
  @OneToMany(() => Friendship, (friendship) => friendship.invitorUser)
  invitorFriendships: Friendship[];

  /** Дружбы, в которые пользователь был приглашен */
  @OneToMany(() => Friendship, (friendship) => friendship.invitedUser)
  invitedFriendships: Friendship[];
}
