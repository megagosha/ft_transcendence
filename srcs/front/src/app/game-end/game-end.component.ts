import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../services/game.service';
import { User } from '../services/search-users.interface';
import { GameStatsDto } from '../game/game.dto';

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.component.html',
  styleUrls: ['./game-end.component.css']
})
export class GameEndComponent implements OnInit {

  game: Observable<GameStatsDto> | undefined;
  info: GameStatsDto;
  constructor(private route: ActivatedRoute, private gameService: GameService, private router: Router) {
    this.info = {
      id: 0,
      score: [],
      userLost: { avatarImgName: '', id: 0, status: '', username: '' },
      userWon: { avatarImgName: '', id: 0, status: '', username: '' },
      timeEnd: new Date()
    };
  }

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      this.router.navigate(['/']);
    }
    this.game = this.gameService.getGameResult(Number(gameId));
    this.game.subscribe((res: GameStatsDto) => {
      this.info = res;
    })

  }

  back() {
    this.router.navigate(['/']);
  }
}
