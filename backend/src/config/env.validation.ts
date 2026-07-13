import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Shape + rules for process.env. Validated once at boot; the app refuses
 * to start if a required variable is missing or malformed.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = '*';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '1d';

  // Short-lived access token carried in the `access_token` cookie.
  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES: string = '15m';

  // Long-lived refresh token lifetime, in days (opaque token in `refresh_token`
  // cookie; only its hash is persisted).
  @IsNumber()
  @IsOptional()
  JWT_REFRESH_EXPIRES_DAYS: number = 30;

  // The following are optional in Phase 1 and become required as their
  // features land (AI in Phase 4, notifications in Phase 10).
  @IsString()
  @IsOptional()
  AI_API_KEY?: string;

  @IsString()
  @IsOptional()
  AI_MODEL?: string;

  @IsString()
  @IsOptional()
  AI_BASE_URL?: string;

  @IsString()
  @IsOptional()
  RESEND_KEY?: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM?: string;

  @IsString()
  @IsOptional()
  VAPID_PUBLIC_KEY?: string;

  @IsString()
  @IsOptional()
  VAPID_PRIVATE_KEY?: string;

  @IsString()
  @IsOptional()
  VAPID_SUBJECT?: string;

  // Redis (Upstash) — the reminder job queue (BullMQ). MUST be a native Redis
  // TCP connection string (`rediss://default:<password>@<host>:6379`), NOT the
  // Upstash REST URL. Optional: if unset, the reminder queue/worker is disabled
  // and the app still boots (same opt-in pattern as push/email).
  @IsString()
  @IsOptional()
  REDIS_URL?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(`Invalid environment configuration:\n  - ${details}`);
  }

  return validated;
}
