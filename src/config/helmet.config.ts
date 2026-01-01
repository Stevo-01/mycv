import { HelmetOptions } from 'helmet';

export const helmetConfig: HelmetOptions = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`], 
      styleSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],  
      scriptSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
      imgSrc: [`'self'`, 'data:', 'https:', 'blob:'], 
      fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
      connectSrc: [`'self'`], 
      frameSrc: [`'none'`],  
      objectSrc: [`'none'`], 
      upgradeInsecureRequests: [],
    },
  },

  // HTTP Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Cross-Origin settings (needed for Swagger)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
};