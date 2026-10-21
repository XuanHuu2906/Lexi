import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Converts every thrown error into one consistent JSON shape so the frontend
 * can rely on a single error contract regardless of where the error came from.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const pathWithoutQuery = request.url.split('?')[0];
    const isAuth = pathWithoutQuery.startsWith('/auth/');
    if (isAuth) response.setHeader('Cache-Control', 'no-store');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        message = (r.message as string | string[]) ?? exception.message;
        error = (r.error as string) ?? exception.name;
      }
    } else if (exception instanceof Error) {
      error = exception.name;
    }

    if (status >= 500) {
      // Provider/ORM stacks, query strings and URL segments may contain private
      // prompts, credentials or identifiers. Log only the operation and status.
      this.logger.error(
        `${isAuth ? 'Authentication' : request.method} request failed (${status})`,
      );
    }

    const body: ErrorBody = {
      success: false,
      statusCode: status,
      message,
      error,
      path: pathWithoutQuery,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}
