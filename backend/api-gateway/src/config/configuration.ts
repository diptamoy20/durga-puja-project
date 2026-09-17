import { registerAs } from '@nestjs/config';

const int = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default registerAs('gateway', () => ({
  /**
   * The spec assigns the gateway port 5000, but PostgreSQL already occupies
   * 5000 on this machine, so the default is 5050. Override with GATEWAY_PORT.
   */
  port: int(process.env.GATEWAY_PORT, 5050),
  globalPrefix: 'api',
  apiVersion: 'v1',

  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  swagger: {
    enabled: (process.env.SWAGGER_ENABLED ?? 'true').toLowerCase() !== 'false',
    path: process.env.SWAGGER_PATH ?? 'api/docs',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-only-insecure-access-secret-change-me',
    issuer: process.env.JWT_ISSUER ?? 'durga-puja-gs',
  },

  throttle: {
    ttl: int(process.env.THROTTLE_TTL, 60),
    limit: int(process.env.THROTTLE_LIMIT, 120),
  },

  upload: {
    dir: process.env.UPLOAD_DIR ?? './storage/uploads',
    maxMb: int(process.env.MAX_UPLOAD_MB, 25),
  },
}));
