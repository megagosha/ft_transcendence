import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/user.entity";
import { Chat } from "./chat.entity";

export enum UserChatRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  PARTICIPANT = "PARTICIPANT",
}

export enum UserChatStatus {
  ACTIVE = "ACTIVE",
  MUTED = "MUTED",
  BANNED = "BANNED",
}

@Entity("ft_user_chat_link")
@Index("userchatlink_user_chat_index", ["user", "chat"], { unique: true })
export class UserChatLink {
  public static readonly USER_CHAT_STATUS_LENGTH: number = 15;
  public static readonly USER_CHAT_ROLE_LENGTH: number = 15;
  public static readonly SUBSCRIPTION_STATUS_LENGTH: number = 15;

  /** Id связи */
  @PrimaryGeneratedColumn()
  id: number;

  /** Пользователь */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  /** Статус пользователя в чате */
  @Column({
    name: "user_status",
    length: UserChatLink.USER_CHAT_STATUS_LENGTH,
    nullable: false,
  })
  userStatus: UserChatStatus;

  /** Роль пользователя в чате */
  @Column({
    name: "user_role",
    length: UserChatLink.USER_CHAT_ROLE_LENGTH,
    nullable: false,
  })
  userRole: UserChatRole;

  /** Чат */
  @ManyToOne(() => Chat, { nullable: false })
  @JoinColumn({ name: "chat_id", referencedColumnName: "id" })
  chat: Chat;

  /** Дата создания */
  @CreateDateColumn({ name: "datetime_creat", nullable: false })
  dateTimeCreate: Date;

  /** Дата истечения бана для пользователя */
  @Column({ name: "datetime_block_expire", nullable: true })
  dateTimeBlockExpire: Date;

  /** Верификация */
  @Column({ name: "verified", nullable: false })
  verified: boolean;
}
