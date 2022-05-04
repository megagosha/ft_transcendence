import { PlayerMatchDto } from "./player-match.dto";

export interface OpponentDto {
  opponent: PlayerMatchDto;
  username: string;
  left: boolean;
}
