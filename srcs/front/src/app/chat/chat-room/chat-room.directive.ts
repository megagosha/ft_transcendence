import {Directive, ViewContainerRef} from "@angular/core";

@Directive({selector: "[chatRoom]"})
export class ChatRoomDirective {
  constructor(public containerRef: ViewContainerRef) { }
}
