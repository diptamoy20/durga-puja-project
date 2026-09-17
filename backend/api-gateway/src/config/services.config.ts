import { SERVICE_TOKENS } from '@dpgc/shared';
import { registerAs } from '@nestjs/config';

const int = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export interface ServiceEndpoint {
  token: string;
  name: string;
  host: string;
  port: number;
}

/**
 * Where each microservice listens. Only the gateway knows these; they are
 * never sent to the browser.
 */
export default registerAs('services', (): Record<string, ServiceEndpoint> => ({
  auth: {
    token: SERVICE_TOKENS.AUTH,
    name: 'auth-service',
    host: process.env.AUTH_SERVICE_HOST ?? 'localhost',
    port: int(process.env.AUTH_SERVICE_PORT, 5001),
  },
  user: {
    token: SERVICE_TOKENS.USER,
    name: 'user-service',
    host: process.env.USER_SERVICE_HOST ?? 'localhost',
    port: int(process.env.USER_SERVICE_PORT, 5002),
  },
  registration: {
    token: SERVICE_TOKENS.REGISTRATION,
    name: 'registration-service',
    host: process.env.REGISTRATION_SERVICE_HOST ?? 'localhost',
    port: int(process.env.REGISTRATION_SERVICE_PORT, 5003),
  },
  content: {
    token: SERVICE_TOKENS.CONTENT,
    name: 'content-service',
    host: process.env.CONTENT_SERVICE_HOST ?? 'localhost',
    port: int(process.env.CONTENT_SERVICE_PORT, 5004),
  },
  gallery: {
    token: SERVICE_TOKENS.GALLERY,
    name: 'gallery-service',
    host: process.env.GALLERY_SERVICE_HOST ?? 'localhost',
    port: int(process.env.GALLERY_SERVICE_PORT, 5005),
  },
  atlas: {
    token: SERVICE_TOKENS.ATLAS,
    name: 'atlas-service',
    host: process.env.ATLAS_SERVICE_HOST ?? 'localhost',
    port: int(process.env.ATLAS_SERVICE_PORT, 5006),
  },
  events: {
    token: SERVICE_TOKENS.EVENTS,
    name: 'events-service',
    host: process.env.EVENTS_SERVICE_HOST ?? 'localhost',
    port: int(process.env.EVENTS_SERVICE_PORT, 5007),
  },
  notification: {
    token: SERVICE_TOKENS.NOTIFICATION,
    name: 'notification-service',
    host: process.env.NOTIFICATION_SERVICE_HOST ?? 'localhost',
    port: int(process.env.NOTIFICATION_SERVICE_PORT, 5008),
  },
}));
