import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "../../users/user.entity";
import { Chat } from "./chat.entity";

@Entity("ft_user_socket")
export class UserSocket {
  public static readonly ID_LENGTH: number = 50;

  /** Id сокета */
  @PrimaryColumn({
    name: "id",
    length: UserSocket.ID_LENGTH,
    nullable: false,
    unique: true,
  })
  id: string;

  /** Пользователь */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  /** Активный чат пользователя, если сокет создан для чата */
  @ManyToOne(() => Chat, { nullable: true })
  @JoinColumn({ name: "active_chat_id", referencedColumnName: "id" })
  activeChat: Chat;
}
