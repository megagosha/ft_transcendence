import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { Ball, Player } from "./elements.entity";
import { B, G } from '@angular/cdk/keycodes';
import { GameService } from '../services/game.service';
import { Observable, Subscription } from 'rxjs';
import { GameDto } from './game.dto';
import { UserService } from '../services/user.service';
import { error } from '@angular/compiler/src/util';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, Ball, Paddle, Bounds, GameObject, Coordinates } from './elements.entity';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  public width: number = 1000;
  private jsTimer: number = 0;
  public height: number = 660;
  private up: boolean = false;
  private down: boolean = false;
  private redrawFlag: boolean = false;
  public pInfo: {
    l: number;
    r: number;
  } = {
    l: 0,
    r: 0
  };
  game: Game = new Game(this.width, this.height);

  canvas: HTMLCanvasElement | null = null;
  private opponentId: number;
  private ctx: CanvasRenderingContext2D | undefined;

  @ViewChild('canvasPoint', { static: true })
  canvasPoint: ElementRef = {} as ElementRef<HTMLCanvasElement>;

  constructor(private route: ActivatedRoute, public gameService: GameService, public userService: UserService, private router: Router) {
    if (gameService.oppenentId == 0 && !this.gameService.watch) router.navigateByUrl('/chat');
    this.opponentId = gameService.oppenentId;
    this.adjustDimensions();


    if (this.gameService.watch) {
      this.pInfo.l = this.gameService.watch.userAId;
      this.pInfo.r = this.gameService.watch.userBId;
      console.log(this.pInfo);
      return;
    }
    this.game.setPlayers(this.userService.user.id,
      this.userService.user.username,
      this.gameService.oppenentId,
      this.gameService.opponentUsername,
      this.gameService.left);
    this.pInfo.l = this.gameService.left ? this.userService.user.id : this.opponentId;
    this.pInfo.r = this.gameService.left ? this.opponentId : this.userService.user.id;
  }

  ngOnInit(): void {
    this.ctx = this.canvasPoint.nativeElement.getContext('2d');
    this.canvas = this.canvasPoint.nativeElement;
    if (this.gameService.watch) {
      this.game.setPlayers(this.gameService.watch.userAId,
        this.gameService.watch.userAUsername,
        this.gameService.watch.userBId,
        this.gameService.watch.userBUsername,
        true);
      this.gameService.gameUpdate().subscribe((game: GameDto) => {
        if (!game || !game.players || !this.gameService.watch)
          return;
        this.updateObjects(game, this.gameService.watch.userAId, this.gameService.watch.userBId);
      });
      this.render();
      return;
    }

    this.gameService.gameUpdate().subscribe((game: GameDto) => {
      if (!game || !game.players || !game.players[this.opponentId])
        return;
      this.updateObjects(game, this.opponentId, this.userService.user.id);
    });
    this.jsTimer = setInterval(() => this.sendPos(), 16);
    this.render();
  }

  ngOnDestroy() {
    clearInterval(this.jsTimer);
    if (this.gameService.watch) {
      this.gameService.watch = undefined;
      return;
    }
    this.gameService.endGame(this.userService.user.id);
  }

  adjustedCords(isHeight: boolean, cord: number) {
    if (isHeight)
      return this.height / 100 * cord;
    else
      return this.width / 100 * cord;
  }

  setObjectPos(obj: GameObject, x: number, y: number) {
    obj.cords.x = this.adjustedCords(false, x);
    obj.cords.y = this.adjustedCords(true, y);
  }

  updateObjects(game: GameDto, player1: number, player2: number) {
    this.setObjectPos(this.game.ball, game.ball.x, game.ball.y);
    this.setObjectPos(this.game.players[player1], game.players[player1].x, game.players[player1].y);
    this.game.players[player1].score = game.players[player1].score;
    this.game.players[player2].score = game.players[player2].score;
    if (this.gameService.watch || this.redrawFlag) {
      if (this.redrawFlag) {
        this.game.players[player1].height = this.height * 0.15;
        this.game.players[player2].height = this.height * 0.15;
        this.redrawFlag = false;
      }
      this.setObjectPos(this.game.players[player2], game.players[player2].x, game.players[player2].y);
    }
  }

  private renderBall(obj: GameObject, color: string ) {
    if (!this.ctx)
      return;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(obj.cords.x,
      obj.cords.y,
      this.width * 0.01,
      0,
      2*Math.PI, );
    this.ctx.fill();

  }

  private drawRectObj(obj: GameObject, color: string) {
    if (!this.ctx)
      return;
    this.ctx.fillStyle = color;
    let bounds: Bounds = obj.getBoundaries();
    this.ctx.fillRect(bounds.left, bounds.top, obj.width, obj.height);
  }

  render(): void {
    if (!this.ctx || !this.game)
      return;
    this.ctx.fillStyle = 'rgb(0,0,0)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    // this.drawRectObj(this.game.ball, 'orange');
    this.drawRectObj(this.game.players[this.pInfo.l], 'orange');
    this.drawRectObj(this.game.players[this.pInfo.r], 'orange');
    this.renderBall(this.game.ball, 'orange');
    window.requestAnimationFrame(() => this.render());
  }

  private sendPos() {
    if (!this.game) return;
    let bounds = this.game.players[this.userService.user.id].getBoundaries();
    if (this.up && bounds.top > 0) {
      this.game.players[this.userService.user.id].accelerate(0.5, true);
    } else if (this.down && bounds.bottom < this.height)
      this.game.players[this.userService.user.id].accelerate(0.5, false);
    else this.game.players[this.userService.user.id].slowDown(0.7);
    this.game.players[this.userService.user.id].move();
    this.gameService.sendPaddleMove({
      x: this.game.players[this.userService.user.id].cords.x / this.width * 100,
      y: this.game.players[this.userService.user.id].cords.y / this.height * 100
    });
  }

  @HostListener('window:resize')
  redraw() {
    this.redrawFlag = true;

    this.width = window.innerWidth * 0.9;
    this.height = window.innerHeight * 0.6;

  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.game || this.gameService.watch) return;
    if (event.code == 'ArrowUp' || event.code == 'ArrowRight') {
      // console.log('arrow uo');
      // this.game.playerA.accelerateUp(0);
      this.up = true;
      // console.log(this.game.playerA.cords.y);
    }
    if (event.code == 'ArrowDown' || event.code == 'ArrowLeft') {
      this.down = true;
      // console.log('arrowdown');
      // this.game.playerA.accelerateDown(this.height);
    }
    window.focus();
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (!this.game || this.gameService.watch) return;
    if (event.code == 'ArrowUp' || event.code == 'ArrowRight') {
      this.up = false;
    }
    if (event.code == 'ArrowDown' || event.code == 'ArrowLeft') {
      this.down = false;
    }
    window.focus();
  }

  adjustForDpi() {
    if (!this.canvas)
      return;
    // this.canvas.style.width = "100%";
    // this.canvas.style.height = "100%";
    // let canvas_gcs = getComputedStyle(this.canvas);
    // let canvas_css_width = canvas_gcs.getPropertyValue("width").slice(0, -2);
    // let canvas_css_height = canvas_gcs.getPropertyValue("height").slice(0, -2);
    //
    // let dpi = window.devicePixelRatio;
    // let setAttr = this.canvas.setAttribute.bind(this.canvas);
    // setAttr("width", (Number(canvas_css_width) * dpi).toString());
    // setAttr("height", (Number(canvas_css_height) * dpi).toString());
    // this.canvas.style.width = canvas_css_width;
    // this.canvas.style.height = canvas_css_height;
  }

  private adjustDimensions() {
    // let width = window.innerWidth;
    // let height = window.innerHeight;
    //
    // this.width = width * 0.8;
    // this.height = height * 0.8;

  }

  stopGame() {
    this.gameService.gameStop();
  }
}
