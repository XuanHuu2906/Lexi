import { AuthService } from './auth.service';
import { MobileLoginDto, MobileRefreshDto, MobileRegisterDto } from './dto/mobile-auth.dto';
export declare class MobileAuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: MobileRegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        accessExpiresIn: number;
        user: import("./auth.service").SafeUser;
    }>;
    login(dto: MobileLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        accessExpiresIn: number;
        user: import("./auth.service").SafeUser;
    }>;
    refresh(dto: MobileRefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
        accessExpiresIn: number;
    }>;
    logout(dto: MobileRefreshDto): Promise<{
        message: string;
    }>;
    private nativeTokens;
}
