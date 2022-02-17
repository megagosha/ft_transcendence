import { UserChatLink } from "./model/user-chat-link.entity";
import { Repository } from "typeorm";
import { Chat } from "./model/chat.entity";
import { User } from "../users/user.entity";
export declare enum ChatAction {
    CHAT_INFO = 0,
    ADD_PARTICIPANT = 1,
    UPDATE_CHAT_INFO = 2,
    UPDATE_STATUS = 3,
    UPDATE_ROLE = 4,
    UPDATE_ACCESS = 5,
    RECEIVE_MESSAGE = 6,
    SEND_MESSAGE = 7,
    ENTER_CHAT = 8
}
export declare class ChatServiceSupport {
    private readonly userChatLinkRepository;
    private readonly chatRepository;
    private static readonly ROLES;
    private static readonly STATUSES;
    private static readonly TYPES;
    private static readonly VERIFICATIONS;
    constructor(userChatLinkRepository: Repository<UserChatLink>, chatRepository: Repository<Chat>);
    findChatById(id: number): Promise<Chat>;
    findUserChatLink(user: User, chat: Chat, throwExc?: boolean): Promise<UserChatLink>;
    filterUserChatLinks(user: User | null, chat: Chat | null, chatname: string | null, username: string | null, verified: boolean | null, take: number | null, skip: number | null): Promise<UserChatLink[]>;
    findSecondChatLink(user: User, chat: Chat): Promise<UserChatLink>;
    updateChat(chat: Chat): Promise<void>;
    existsChatName(chatName: string, chat: Chat | null): Promise<boolean>;
    findChats(name: string, take: number, skip: number): Promise<Chat[]>;
    unblockUserChatLinks(dateExpire: Date): Promise<void>;
    static verifyAction(userChatLink: UserChatLink, action: ChatAction): void;
    findUserChatLinksByChats(user: User, chats: Chat[]): Promise<UserChatLink[]>;
    getChatAvatarPath(chat: Chat): string;
}
