import { Component, OnInit }                        from '@angular/core';

@Component({
  selector: 'app-match-making',
  templateUrl: './match-making.component.html',
  styleUrls: ['./match-making.component.css'],
})
export class MatchMakingComponent implements OnInit {

  paddleColor: any;
  ballColor: any;

  constructor() { }

  ngOnInit(): void {
  }

}
