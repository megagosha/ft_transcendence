import {
	Column,
	CreateDateColumn,
	Entity, JoinColumn, OneToMany, OneToOne,
	PrimaryGeneratedColumn,
	VersionColumn
} from "typeorm";
import {UserStatus} from "./type/UserStatus";
import {GameStatistic} from "./GameStatistic";
import {Friendship} from "./Friendship";

/** Пользователь */
@Entity({name: "ft_user"})
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
	@Column({length: User.USERNAME_LENGTH, nullable: false, unique: true})
	username: string;

	/** Пароль */
	@Column({length: User.PASSWORD_LENGTH, nullable: false})
	password: string;

	/** Дата регистрации */
	@CreateDateColumn({nullable: false, update: false, insert: false})
	registerDate: Date;

	/** Дата послднего логина */
	@Column({nullable: false})
	lastLoginDate: Date;

	/** Статус */
	@Column({length: User.USER_STATUS_LENGTH, nullable: false})
	status: UserStatus;

	/** Наименование изоброжения аватарки */
	@Column({length: User.AVATAR_IMG_NAME_LENGTH, nullable: true})
	avatarImgName: string;

	/** Статисктика и достижения пользователя в играх */
	@OneToOne(() => GameStatistic, {nullable: false})
	@JoinColumn({name: "game_statistic_id", referencedColumnName: "id"})
	statistic: GameStatistic = new GameStatistic();

	/** Дружбы, в которых пользователь является инициатором */
	@OneToMany(() => Friendship, friendship => friendship.invitorUser)
	invitorFriendships: Friendship [];

	/** Дружбы, в которые пользователь был приглашен */
	@OneToMany(() => Friendship, friendship => friendship.invitedUser)
	invitedFriendships: Friendship [];
}
