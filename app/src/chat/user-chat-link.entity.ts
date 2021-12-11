import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Chat } from "./chat.entity";

export enum UserInChatStatus {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  PARTICIPANT = "PARTICIPANT",
  BANNED_USER = "BANNED_USER",
}

@Entity("ft_user_chat_link")
@Index("userchatlink_user_chat_index", ["user", "chat"], { unique: true })
export class UserChatLink {
  public static readonly USER_CHAT_STATUS_LENGTH: number = 15;

  /** Id связи */
  @PrimaryGeneratedColumn()
  id: number;

  /** Пользователь */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  /** Чат */
  @ManyToOne(() => Chat, { nullable: false })
  @JoinColumn({ name: "chat_id", referencedColumnName: "id" })
  chat: Chat;

  /** Статус пользователя в чате */
  @Column({
    name: "user_status",
    length: UserChatLink.USER_CHAT_STATUS_LENGTH,
    nullable: false,
  })
  userStatus: UserInChatStatus;

  /** Дата истечения бана для пользователя */
  @Column({ name: "datetime_ban_expire", nullable: true })
  dateTimeBanExpire: Date;
}
