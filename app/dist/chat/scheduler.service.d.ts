import { ChatServiceSupport } from "./chat.service-support";
export declare class SchedulerService {
    private readonly chatServiceSupport;
    constructor(chatServiceSupport: ChatServiceSupport);
    unblockUserChatLinks(): Promise<void>;
}
