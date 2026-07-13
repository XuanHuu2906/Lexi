import { ChatKind } from '../../../generated/prisma/client';
export declare class ListChatThreadsDto {
    kind: ChatKind;
}
export declare class CreateChatThreadDto {
    kind: ChatKind;
    title: string;
    messages: unknown[];
}
export declare class UpdateChatThreadDto {
    title?: string;
    messages: unknown[];
}
