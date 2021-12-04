import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity("ft_friendship")
@Index("friendship_invitor_invited_index", ["invitorUser", "invitedUser"], {unique: true})
@Index("friendship_invitor_index", ["invitorUser"])
@Index("friendship_invited_index", ["invitedUser"])
export class Friendship {

	/** id */
	@PrimaryGeneratedColumn()
	id: number;

	/** Пользователь, который пригласил дружить */
	@ManyToOne(() => User)
	@JoinColumn({name: "invitor_user_id", referencedColumnName: "id"})
	invitorUser: User;

	/** Пользователь, которого пригласили дружить */
	@ManyToOne(() => User)
	@JoinColumn({name: "invited_user_id", referencedColumnName: "id"})
	invitedUser: User;

	/** Дата начала дружбы. Считается от момента двусторонней дружбы */
	@Column({nullable: true})
	beginDate: Date;

	/** Признак двусторонней дружбы */
	@Column({nullable: false, default: false})
	friends: boolean;
}
