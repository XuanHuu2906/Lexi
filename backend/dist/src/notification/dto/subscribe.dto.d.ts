export declare class PushKeysDto {
    p256dh: string;
    auth: string;
}
export declare class SubscribeDto {
    endpoint: string;
    keys: PushKeysDto;
}
export declare class UnsubscribeDto {
    endpoint: string;
}
