/**
 * Fails fast at boot if the environment is misconfigured. A service that
 * starts with a placeholder JWT secret is worse than one that refuses to
 * start, because the problem only shows up as forged tokens later.
 */
const PLACEHOLDER_SECRETS = [
  'dev-only-insecure-access-secret-change-me',
  'dev-only-insecure-refresh-secret-change-me',
  'your-secret-key',
  'CHANGE_ME',
];

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const errors: string[] = [];
  const nodeEnv = String(config.NODE_ENV ?? 'development');

  const databaseUrl = config.DATABASE_URL ? String(config.DATABASE_URL) : '';

  if (!databaseUrl) {
    errors.push('DATABASE_URL is required. Copy backend/.env.example to backend/.env.');
  } else if (databaseUrl.includes('CHANGE_ME')) {
    errors.push(
      'DATABASE_URL still contains the CHANGE_ME placeholder. Set your PostgreSQL password in backend/.env.',
    );
  }

  const secret = config.JWT_SECRET ? String(config.JWT_SECRET) : '';
  const refreshSecret = config.JWT_REFRESH_SECRET ? String(config.JWT_REFRESH_SECRET) : '';

  if (!secret) errors.push('JWT_SECRET is required.');
  if (!refreshSecret) errors.push('JWT_REFRESH_SECRET is required.');

  if (secret && secret === refreshSecret) {
    errors.push(
      'JWT_SECRET and JWT_REFRESH_SECRET must differ, otherwise a refresh token can be replayed as an access token.',
    );
  }

  // Placeholders are tolerated locally but must never reach a deployed env.
  if (nodeEnv === 'production') {
    for (const [key, value] of [
      ['JWT_SECRET', secret],
      ['JWT_REFRESH_SECRET', refreshSecret],
    ] as const) {
      if (PLACEHOLDER_SECRETS.includes(value)) {
        errors.push(`${key} is still set to a development placeholder.`);
      }

      if (value.length < 32) {
        errors.push(`${key} must be at least 32 characters in production.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n  - ${errors.join('\n  - ')}`);
  }

  return config;
}
