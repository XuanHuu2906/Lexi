import { Throttle } from '@nestjs/throttler';

/**
 * Tighter rate limit for endpoints that call the AI provider on every request.
 * These are expensive (latency + cost) so we cap them well below the global
 * 60/min: 20 requests per minute per client. Applied on top of the global guard.
 */
export const AiThrottle = () =>
  Throttle({ default: { limit: 20, ttl: 60_000 } });
