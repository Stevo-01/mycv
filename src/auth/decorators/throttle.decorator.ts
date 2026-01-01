import { Throttle } from '@nestjs/throttler';

// Custom decorators for different rate limits
export const ThrottleAuth = () => Throttle({ default: { limit: 5, ttl: 60000 } });  // 5 requests per minute
export const ThrottlePasswordReset = () => Throttle({ default: { limit: 3, ttl: 300000 } });  // 3 requests per 5 minutes
export const ThrottleStrict = () => Throttle({ default: { limit: 3, ttl: 60000 } });  // 3 requests per minute