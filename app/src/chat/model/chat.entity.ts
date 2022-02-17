import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from "typeorm";
import { User } from "../../users/user.entity";

export enum ChatType {
  PROTECTED = "PROTECTED",
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  DIRECT = "DIRECT",
}

@Entity("ft_chat")
@Index("chat_name_index", ["name"], { unique: true })
export class Chat {
  public static readonly NAME_LENGTH: number = 50;
  public static readonly TYPE_LENGTH: number = 10;
  public static readonly PASSWORD_LENGTH: number = 60;
  public static readonly DESCRIPTION_LENGTH: number = 500;

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

  @Column({
    name: "datetime_password_change",
    nullable: true,
  })
  dateTimePasswordChange: Date;

  /** Аватар */
  @Column({name: "avatar", nullable: true})
  avatar: string;

  /** Владелец чата */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "owner_user_id", referencedColumnName: "id" })
  ownerUser: User;

  /** Время последнего действия в чате */
  @Column({ name: "datetime_last_message", nullable: true })
  dateTimeLastAction: Date;
}
