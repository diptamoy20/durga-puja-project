/**
 * Fails fast at boot if the gateway is misconfigured, rather than surfacing
 * the problem later as unexplained 401s or connection refusals.
 */
const PLACEHOLDERS = [
  'dev-only-insecure-access-secret-change-me',
  'dev-only-insecure-refresh-secret-change-me',
  'your-secret-key',
  'CHANGE_ME',
];

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const errors: string[] = [];
  const nodeEnv = String(config.NODE_ENV ?? 'development');

  const secret = config.JWT_SECRET ? String(config.JWT_SECRET) : '';

  if (!secret) {
    errors.push('JWT_SECRET is required. Copy backend/.env.example to backend/.env.');
  }

  // The gateway verifies tokens locally, so its secret must match the one the
  // auth service signs with. A mismatch rejects every valid token.
  if (nodeEnv === 'production') {
    if (PLACEHOLDERS.includes(secret)) {
      errors.push('JWT_SECRET is still set to a development placeholder.');
    }

    if (secret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production.');
    }
  }

  const port = Number(config.GATEWAY_PORT ?? 5050);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    errors.push(`GATEWAY_PORT must be a valid port number, got "${String(config.GATEWAY_PORT)}".`);
  }

  // Guard against the documented collision on this machine, where PostgreSQL
  // already listens on 5000.
  const databaseUrl = String(config.DATABASE_URL ?? '');
  const dbPortMatch = /:(\d+)\//.exec(databaseUrl);

  if (dbPortMatch && Number(dbPortMatch[1]) === port) {
    errors.push(
      `GATEWAY_PORT (${port}) collides with the PostgreSQL port in DATABASE_URL. ` +
        'Change GATEWAY_PORT in backend/.env.',
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid gateway configuration:\n  - ${errors.join('\n  - ')}`);
  }

  return config;
}
