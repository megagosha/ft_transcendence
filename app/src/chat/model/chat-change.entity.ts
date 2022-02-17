import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/user.entity";
import { Chat } from "./chat.entity";

export enum ChangeType {
  CREATION = "CREATION",
  ADD_PARTICIPANT = "ADD_PARTICIPANT",
  REMOVE_PARTICIPANT = "REMOVE_PARTICIPANT",
  UPDATE_NAME = "UPDATE_NAME",
  UPDATE_DESCRIPTION = "UPDATE_DESCRIPTION",
  UPDATE_AVATAR = "UPDATE_AVATAR",
  JOIN_CHAT = "JOIN_CHAT",
  LEAVE_CHAT = "LEAVE_CHAT",
}

@Entity("ft_chat_change")
export class ChatChange {
  public static readonly TYPE_LENGTH: number = 20;

  /** Id */
  @PrimaryGeneratedColumn()
  id: number;

  /** Дата изменения чата */
  @CreateDateColumn({ name: "datetime_change", nullable: false, update: false })
  dateTimeChange: Date;

  /** Тип изменения чата */
  @Column({
    name: "type",
    length: ChatChange.TYPE_LENGTH,
    nullable: false,
  })
  type: ChangeType;

  /** Чат, который был изменен */
  @ManyToOne(() => Chat, { nullable: false, eager: true })
  @JoinColumn({ name: "changed_chat_id", referencedColumnName: "id" })
  changedChat: Chat;

  /** Пользователь сделавший измение */
  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: "changer_user_id", referencedColumnName: "id" })
  changerUser: User;

  /** Пользователь которого добавили/удалили */
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: "target_user_id", referencedColumnName: "id" })
  targetUser: User;
}
