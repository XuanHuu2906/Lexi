import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
        user: import("./auth.service").SafeUser;
        csrfToken: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: import("./auth.service").SafeUser;
        csrfToken: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        csrfToken: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    private readRefreshCookie;
}
