import {SocketioConfig} from "ngx-socketio2/lib/socketio.interface";
import {token} from "../app.module";
import {Socketio} from "ngx-socketio2";
import {Injectable} from "@angular/core";

const config: SocketioConfig  = {
  url: '/chat', options: {
    extraHeaders: {
      Authorization: token(),
    }
  }
}

@Injectable({providedIn: 'root'})
export class ChatSocket extends Socketio {
  constructor() {
    super(config);
  }
}