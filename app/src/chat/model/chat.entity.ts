import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from "typeorm";
import { User } from "../../users/user.entity";
import { Message } from "./message.entity";
import { Type } from "class-transformer";

export enum ChatType {
  PROTECTED = "PROTECTED",
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

@Entity("ft_chat")
@Index("chat_name_index", ["name"], { unique: true })
export class Chat {
  public static readonly NAME_LENGTH: number = 50;
  public static readonly TYPE_LENGTH: number = 10;
  public static readonly PASSWORD_LENGTH: number = 60;
  public static readonly DESCRIPTION_LENGTH: number = 1000;

  /** Id */
  @PrimaryGeneratedColumn()
  id: number;

  /** Версия */
  @VersionColumn()
  version: number;

  /** Наименование */
  @Column({ name: "name", length: Chat.NAME_LENGTH, nullable: false })
  name: string;

  /** Описание чата */
  @Column({
    name: "description",
    length: Chat.DESCRIPTION_LENGTH,
    nullable: true,
  })
  description: string;

  /** Дата создания чата */
  @CreateDateColumn({ name: "datetime_create", nullable: false, update: false })
  dateTimeCreate: Date;

  /** Тип чата */
  @Column({
    name: "type",
    length: Chat.TYPE_LENGTH,
    nullable: false,
  })
  type: ChatType;

  /** Пароль. Когда чат является PROTECTED */
  @Column({
    name: "password",
    length: Chat.PASSWORD_LENGTH,
    nullable: true,
  })
  password: string;

  /** Аватарка. Id файла в хранилище */
  @Column({ name: "avatar_file_id", nullable: true })
  avatarFileId: number;

  /** Владелец чата */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "owner_user_id", referencedColumnName: "id" })
  ownerUser: User;

  /** Время последнего действия в чате */
  @Column({ name: "datetime_last_message", nullable: false })
  dateTimeLastAction: Date;
}
