import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { GameStatsDto } from '../game/game.dto';
import { UserService } from '../services/user.service';
import { GameService } from '../services/game.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-one-on-one',
  templateUrl: './one-on-one.component.html',
  styleUrls: ['./one-on-one.component.css']
})
//one on one history.
export class OneOnOneComponent implements OnInit {
  obsArray: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  items: Observable<any> = this.obsArray.asObservable();

  gameList: GameStatsDto[] = [];
  take: number = 10;
  skip: number = 0;
  @Input()
  value: number = 0;

  constructor(private userService: UserService, private gameService: GameService) {
  }

  ngOnInit(): void {
    if (!this.value)
      return;

    this.gameService.getPersonalHistory(this.value, this.take, this.skip).subscribe((res: GameStatsDto[]) => {
      this.gameList = res;
      this.skip += 10;
    });
  }
  ngOnChanges() {

    this.gameService.getPersonalHistory(this.value, this.take, this.skip).subscribe((res: GameStatsDto[]) => {
      this.gameList = res;
      this.skip += 10;
    });
  }

  onScroll() {
  }
}
