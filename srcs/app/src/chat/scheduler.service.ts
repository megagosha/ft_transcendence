import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ChatServiceSupport } from "./chat.service-support";

@Injectable()
export class SchedulerService {
  constructor(private readonly chatServiceSupport: ChatServiceSupport) {}

  @Cron("0 0 0 * * *")
  async unblockUserChatLinks() {
    Logger.log("Unblock user chat links start");
    await this.chatServiceSupport.unblockUserChatLinks(new Date());
    Logger.log("Unblock user chat links end");
  }
}
