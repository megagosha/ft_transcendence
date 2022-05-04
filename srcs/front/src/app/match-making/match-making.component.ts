import { Component, OnInit }    from '@angular/core';
import { GameService }          from "../services/game.service";
import { ColorPickerComponent } from "ngx-color-picker";

@Component({
  selector: 'app-match-making',
  templateUrl: './match-making.component.html',
  styleUrls: ['./match-making.component.css'],
})
export class MatchMakingComponent implements OnInit {

  paddleColor: string = "orange";
  ballColor: string = "orange";

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  startMatch() {
    this.gameService.matchMaking(this.paddleColor, this.ballColor);
  }
}
