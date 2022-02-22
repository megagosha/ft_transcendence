import { Component, OnInit }           from '@angular/core';
import { DataSource }                  from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameService }                 from "../services/game.service";
import { LadderDto }                   from "../game/ladder.dto";

export interface PeriodicElement {
    position: number;
    player: { username: string, avatarImg: string };
    games_won: number;
}

const template: LadderDto[] = [
    {position: 1, username: '', avatarImgName: "http://localhost:3000/default.png", games_won: 0},

];

@Component({
    selector: 'app-ladder',
    templateUrl: './ladder.component.html',
    styleUrls: ['./ladder.component.css']
})
export class LadderComponent implements OnInit {

    ladderColumns: string[] = ['position', 'player', 'games_won'];
    dataSource: LadderDataSource;

    constructor( private gameService: GameService ) {
      this.dataSource = new LadderDataSource(this.gameService);
    }

    ngOnInit(): void {
      this.dataSource.update();
    }

}

export class LadderDataSource extends DataSource<LadderDto> {
    /** Stream of data that is provided to the table. */
    private data = new BehaviorSubject<LadderDto[]>([]);
    private loadingData = new BehaviorSubject<boolean>(false);
    public loading = this.loadingData.asObservable();

    constructor( private gameService: GameService ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<LadderDto[]> {
        return this.gameService.getLadder();
    }

    disconnect() {
        this.data.complete();
        this.loadingData.complete();
    }

    update() {
        this.loadingData.next(true);
        this.gameService.getLadder().subscribe(res => {
            this.data.next(res);
        })
    }
}