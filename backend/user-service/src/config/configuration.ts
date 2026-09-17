import { registerAs } from '@nestjs/config';

export default registerAs('user', () => ({
  host: process.env.USER_SERVICE_HOST ?? 'localhost',
  port: Number(process.env.USER_SERVICE_PORT ?? 5002),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
}));
