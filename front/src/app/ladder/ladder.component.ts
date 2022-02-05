import { Component, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PeriodicElement {
  position: number;
  player:  {username: string, avatarImg: string};
  games_played: number;
  games_won: number;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, player: {username: 'ivan', avatarImg: "http://localhost:3000/default.png"}, games_played: 10, games_won: 5},
  {position: 1, player: {username: 'george', avatarImg: "http://localhost:3000/default.png"}, games_played: 20, games_won: 5},
  {position: 1, player: {username: 'peter', avatarImg: "http://localhost:3000/default.png"}, games_played: 30, games_won: 5},
  {position: 1, player: {username: 'katya', avatarImg: "http://localhost:3000/default.png"}, games_played: 50, games_won: 5},
  {position: 1, player: {username: 'vasya', avatarImg: "http://localhost:3000/default.png"}, games_played: 10, games_won: 5},
];

@Component({
  selector: 'app-ladder',
  templateUrl: './ladder.component.html',
  styleUrls: ['./ladder.component.css']
})
export class LadderComponent implements OnInit {

  ladderColumns: string[] = ['position', 'player', 'games_played', 'games_won'];
  dataSource: PeriodicElement[] = ELEMENT_DATA;
  constructor() { }

  ngOnInit(): void {

  }

}

export class ExampleDataSource extends DataSource<PeriodicElement> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<PeriodicElement[]>(ELEMENT_DATA);

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<PeriodicElement[]> {
    return this.data;
  }

  disconnect() {}
}
