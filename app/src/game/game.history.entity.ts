import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

/** Статисктика и достижения пользователя */
@Entity('ft_game_history')
export class GameStatistic {
  /** Id */
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  userLost: User;

  @Column({ nullable: true })
  userWonId: number;

  /** Пользователь */
  @ManyToOne(() => User)
  @JoinColumn()
  userWon: User;

  /** Количество выигранных игр */
  @Column({ type: 'simple-array' })
  score: number[];

  /** Количество проигранных игр */
  @CreateDateColumn()
  timeEnd: Date;
}

// 1. user_id -> score
// 2. user_b_id -> score_b
// 3. timestamp
// 4. game_id

// game id timestart time_end user_Won userLost score
// user -> game_id -> score;
// game tb -> id timestamp start timestamp end
