import { Body, Controller, Header, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService, IssuedTokens } from './auth.service';
import { Public } from './decorators/public.decorator';
import {
  MobileLoginDto,
  MobileRefreshDto,
  MobileRegisterDto,
} from './dto/mobile-auth.dto';

const tokenSchema = {
  type: 'object',
  required: ['accessToken', 'refreshToken', 'accessExpiresIn'],
  properties: {
    accessToken: { type: 'string', description: 'Short-lived Bearer JWT' },
    refreshToken: { type: 'string', description: 'Opaque rotating credential' },
    accessExpiresIn: { type: 'integer', example: 900 },
  },
};
const envelopeSchema = (withUser: boolean) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: {
      ...tokenSchema,
      properties: {
        ...tokenSchema.properties,
        ...(withUser
          ? {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  provider: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  role: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            }
          : {}),
      },
    },
  },
});

@ApiTags('native-auth')
@ApiBadRequestResponse({ description: 'Invalid credential shape' })
@ApiUnauthorizedResponse({
  description: 'Invalid credentials or session expired',
})
@ApiTooManyRequestsResponse({ description: 'Rate limited; honor Retry-After' })
@Public()
@Controller('auth/mobile')
export class MobileAuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register native account; no cookies' })
  @ApiCreatedResponse({ schema: envelopeSchema(true) })
  async register(@Body() dto: MobileRegisterDto) {
    const { user, tokens } = await this.auth.register(dto);
    return { user, ...this.nativeTokens(tokens) };
  }

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Log in native client using shared account/lockout policy',
  })
  @ApiOkResponse({ schema: envelopeSchema(true) })
  async login(@Body() dto: MobileLoginDto) {
    const { user, tokens } = await this.auth.login(dto);
    return { user, ...this.nativeTokens(tokens) };
  }

  @Post('refresh')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Atomically consume and rotate native refresh credential',
  })
  @ApiOkResponse({ schema: envelopeSchema(false) })
  @ApiConflictResponse({
    description:
      'Concurrent/recently consumed refresh; never blindly retry the old credential',
  })
  async refresh(@Body() dto: MobileRefreshDto) {
    return this.nativeTokens(await this.auth.refresh(dto.refreshToken));
  }

  @Post('logout')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary:
      'Revoke exactly the supplied refresh credential; access JWT not required',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: { message: { type: 'string', example: 'Logged out' } },
        },
      },
    },
  })
  async logout(@Body() dto: MobileRefreshDto) {
    await this.auth.logout(dto.refreshToken);
    return { message: 'Logged out' };
  }

  private nativeTokens(tokens: IssuedTokens) {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresIn: tokens.accessExpiresIn,
    };
  }
}
