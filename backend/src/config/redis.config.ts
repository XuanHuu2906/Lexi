import type { RedisOptions } from 'ioredis';

/**
 * Build ioredis connection options from a Redis URL for BullMQ.
 *
 * We parse the URL ourselves (rather than handing the raw string to ioredis)
 * so we can reliably enable TLS for Upstash's `rediss://…:6379` endpoint and
 * set the BullMQ-required `maxRetriesPerRequest: null`.
 */
export function redisConnectionFromUrl(url: string): RedisOptions {
  const u = new URL(url);
  const isTls = u.protocol === 'rediss:';
  return {
    host: u.hostname,
    port: Number(u.port) || 6379,
    username: u.username ? decodeURIComponent(u.username) : undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    // Upstash requires TLS; an empty object enables it with sane defaults.
    tls: isTls ? {} : undefined,
    // Required by BullMQ so blocking commands aren't aborted by ioredis retries.
    maxRetriesPerRequest: null,
  };
}
