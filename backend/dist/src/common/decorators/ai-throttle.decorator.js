"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiThrottle = void 0;
const throttler_1 = require("@nestjs/throttler");
const AiThrottle = () => (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60_000 } });
exports.AiThrottle = AiThrottle;
//# sourceMappingURL=ai-throttle.decorator.js.map