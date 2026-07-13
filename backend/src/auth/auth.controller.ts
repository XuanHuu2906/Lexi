import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import {
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from './auth-cookies';
import { AuthService, IssuedTokens } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account (sets auth cookies)' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto);
    setAuthCookies(res, tokens);
    // csrfToken is echoed in the body so the SPA can seed it immediately,
    // avoiding a race before the (non-httpOnly) cookie is readable.
    return { user, csrfToken: tokens.csrfToken };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in; sets auth cookies + returns CSRF token' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    setAuthCookies(res, tokens);
    return { user, csrfToken: tokens.csrfToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and reissue cookies' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens: IssuedTokens = await this.authService.refresh(
      this.readRefreshCookie(req),
    );
    setAuthCookies(res, tokens);
    return { csrfToken: tokens.csrfToken };
  }

  // Public so a user with an already-expired access token can still log out.
  // Safe: it only clears cookies and revokes the presented refresh token
  // (which is httpOnly + SameSite=Lax).
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out: revoke refresh token + clear cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(this.readRefreshCookie(req));
    clearAuthCookies(res);
    return { message: 'Logged out' };
  }

  private readRefreshCookie(req: Request): string | undefined {
    const cookies = (req.cookies ?? {}) as Record<string, string>;
    return cookies[REFRESH_COOKIE];
  }
}
