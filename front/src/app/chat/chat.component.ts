import { Component, OnInit } from "@angular/core";



class Message {
  id: number = 0;
  type: boolean = false;
  name: string = "";
  avatar: string = "";
  message: string = "";

  public constructor(id: number, type: boolean, name: string, avatar: string, message: string) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.avatar = avatar;
    this.message = message;
  }
}
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  typesOfFriends: string[] = ["Ivan", "Petr", "Evgeniy", "Alexey", "George"];
  typesOfChats: string[] = ["42 chat", "old chat", "new chat"];
  messages: Message[] = [new Message(1, false, "Elayne Debi", "/assets/user-avatar1.png", "Hello"),
    new Message(2, false, "Elayne Debi", "/assets/user-avatar1.png", "Hi"),
    new Message(3, true, "Ivanov Ivan", "/assets/user-avatar2.png", "sm ms"),
    new Message(4, true, "Ivanov Ivan", "/assets/user-avatar2.png", "verryy looong messageverryy looong messageverryy looong messageverryy looong messageverryy looong messageverryy looong messageverryy looong message"),
    new Message(5, true, "Ivanov Ivan", "/assets/user-avatar2.png", "medium message"),
    new Message(6, false, "Elayne Debi", "/assets/user-avatar1.png", "message message message"),
    new Message(7, true, "Ivanov Ivan", "/assets/user-avatar2.png", "bye bye")];

  constructor() {
  }

  ngOnInit(): void {
  }

}
