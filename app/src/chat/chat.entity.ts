import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { UserChatLink } from "./user-chat-link.entity";
import { Message } from "./message.entity";

@Entity("ft_chat")
export class Chat {
  public static readonly NAME_LENGTH: number = 50;

  /** Id */
  @PrimaryGeneratedColumn()
  id: number;

  /** Версия */
  @VersionColumn()
  version: number;

  /** Наименование */
  @Column({ name: "name", length: Chat.NAME_LENGTH, nullable: false })
  name: string;

  /** Дата создания чата */
  @CreateDateColumn({ name: "datetime_create", nullable: false, update: false })
  dateTimeCreate: Date;

  /** Аватарка. Id файла в хранилище */
  @Column({ name: "avatar_file_id", nullable: true })
  avatarFileId: number;

  /** Владелец чата */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "owner_user_id", referencedColumnName: "id" })
  ownerUser: User;

  /** Связи чата с пользователями */
  @OneToMany(() => UserChatLink, (userChatLink) => userChatLink.chat)
  userChatLinks: UserChatLink[];

  /** Сообщения */
  @OneToMany(() => Message, (message) => message.targetChat)
  messages: Message[];
}
