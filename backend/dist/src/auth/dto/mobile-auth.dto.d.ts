export declare class MobileLoginDto {
    email: string;
    password: string;
}
export declare class MobileRegisterDto extends MobileLoginDto {
    password: string;
}
export declare class MobileRefreshDto {
    refreshToken: string;
}
