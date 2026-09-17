import { AuthenticatedUser } from '@dpgc/shared';

/**
 * Teaches Express about the principal JwtAuthGuard attaches, so
 * `req.user` is typed instead of `any` throughout the gateway.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
