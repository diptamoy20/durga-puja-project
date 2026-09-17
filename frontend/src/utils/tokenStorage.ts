import { STORAGE_KEYS } from '@/constants/routes';
import type { AuthTokens, AuthUser } from '@/types';

/**
 * Persists the session in localStorage so a page reload stays signed in.
 *
 * Trade-off worth being explicit about: localStorage is readable by any script
 * on the page, so it is vulnerable to XSS in a way an httpOnly cookie is not.
 * It is used here because the gateway is a separate origin from the dev server
 * and the API is stateless and CSRF-free by design. Access tokens are
 * short-lived (JWT_EXPIRES_IN) and refresh tokens are revocable server-side,
 * which bounds the damage. Move to httpOnly cookies if the frontend is ever
 * served from the gateway's own origin.
 *
 * Every read is guarded because Safari private mode throws on localStorage.
 */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable; the session simply will not survive a reload.
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to do.
  }
}

export const tokenStorage = {
  getAccessToken: (): string | null => safeGet(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: (): string | null => safeGet(STORAGE_KEYS.REFRESH_TOKEN),

  setTokens: (tokens: AuthTokens): void => {
    safeSet(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    safeSet(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  getUser: (): AuthUser | null => {
    const raw = safeGet(STORAGE_KEYS.USER);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      // Corrupted entry: drop it rather than crashing on every load.
      safeRemove(STORAGE_KEYS.USER);
      return null;
    }
  },

  setUser: (user: AuthUser): void => {
    safeSet(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clear: (): void => {
    safeRemove(STORAGE_KEYS.ACCESS_TOKEN);
    safeRemove(STORAGE_KEYS.REFRESH_TOKEN);
    safeRemove(STORAGE_KEYS.USER);
  },
};
