import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from "typeorm";
import { User } from "../../users/user.entity";
import { Chat } from "./chat.entity";
import { ChatChange } from "./chat-change.entity";

@Entity("ft_message", { orderBy: { dateTimeSend: "DESC" } })
export class Message {
  public static readonly TEXT_LENGTH: number = 2000;

  /** Id */
  @PrimaryGeneratedColumn()
  id: number;

  @VersionColumn()
  version: number;

  /** Текст сообщения */
  @Column({ name: "text", length: Message.TEXT_LENGTH, nullable: true })
  text: string;

  /** Время отправки */
  @CreateDateColumn({
    name: "datetime_send",
    nullable: false,
    update: false,
    insert: false,
  })
  dateTimeSend: Date;

  /** Время редактирования */
  @Column({ name: "datetime_edit", nullable: true })
  dateTimeEdit: Date;

  /** Автор */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "author_user_id", referencedColumnName: "id" })
  authorUser: User;

  /** Чат, в который было отправлено соообщение */
  @ManyToOne(() => Chat, { nullable: false })
  @JoinColumn({ name: "target_chat_id", referencedColumnName: "id" })
  targetChat: Chat;

  /** Изменение чата для которого было создано сообщение */
  @OneToOne(() => ChatChange, { nullable: true, cascade: true })
  @JoinColumn({ name: "chat_change_id" })
  chatChange: ChatChange;
}
