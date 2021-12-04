import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

/** Статисктика и достижения пользователя */
@Entity("ft_game_statistic")
export class GameStatistic {

	/** Id */
	@PrimaryGeneratedColumn()
	id: number;

	/** Пользователь */
	@OneToOne(() => User, user => user.statistic)
	user: User;

	/** Количество выигранных игр */
	@Column({nullable: false, default: 0})
	gameWon: number;

	/** Количество проигранных игр */
	@Column({nullable: false, default: 0})
	gameLost: number;
}
