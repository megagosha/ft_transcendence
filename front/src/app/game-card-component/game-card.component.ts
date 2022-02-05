import { Component, Input, OnInit } from '@angular/core';
import { GameStatsDto } from '../game/game.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-game-card-component',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements OnInit {
  @Input() info: GameStatsDto;
  constructor(private route: ActivatedRoute, private gameService: GameService, private router: Router) {
    this.info = {
      id: 0,
      score: [20, 50],
      userLost: { avatarImgName: 'http://localhost:3000/1/1.png', id: 1, status: '', username: 'very long long name'},
      userWon: { avatarImgName: 'http://localhost:3000/1/1.png', id: 2, status: '', username: 'Hi' },
      timeEnd: new Date()
    };
  }
  ngOnInit(): void {
  }

  formatDate(timeEnd: Date) {
    return formatDate(timeEnd, 'short', 'en-US');
  }
}
