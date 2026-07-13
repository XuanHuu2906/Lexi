"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnectionFromUrl = redisConnectionFromUrl;
function redisConnectionFromUrl(url) {
    const u = new URL(url);
    const isTls = u.protocol === 'rediss:';
    return {
        host: u.hostname,
        port: Number(u.port) || 6379,
        username: u.username ? decodeURIComponent(u.username) : undefined,
        password: u.password ? decodeURIComponent(u.password) : undefined,
        tls: isTls ? {} : undefined,
        maxRetriesPerRequest: null,
    };
}
//# sourceMappingURL=redis.config.js.map