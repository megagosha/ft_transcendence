import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_SNACK_BAR_DATA, matSnackBarAnimations, MatSnackBarRef } from '@angular/material/snack-bar';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-snackbar-actions',
  templateUrl: './snackbar-actions.component.html',
  styleUrls: ['./snackbar-actions.component.css']
})
export class SnackbarActionsComponent implements OnInit {
  public _gameService: GameService;
  constructor(private router: Router, gameService: GameService,
              @Inject(MAT_SNACK_BAR_DATA) public data: any,
              public  snackBarREf: MatSnackBarRef<any>) {
    this._gameService = gameService;
  }

  acceptInvite() {
    this._gameService.acceptInvite(this.data.userId);
    this._gameService.snackBar.dismiss();
  }

  cancel() {
    this._gameService.snackBar.dismiss();
    this._gameService.declineInvite(this.data.userId);
  }

  ngOnInit(): void {
  }

}
