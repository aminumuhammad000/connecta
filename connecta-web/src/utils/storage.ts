const TOKEN_KEY = 'connecta_token';
const TOKEN_TIME_KEY = 'connecta_token_time';
const USER_KEY = 'connecta_user';
const ROLE_KEY = 'connecta_role';
const THEME_KEY = 'connecta_theme';
const ONBOARDING_KEY = 'connecta_onboarding_completed';

// 30 days active session validity + 14-day renewal grace window (44 days total durability)
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const GRACE_PERIOD_MS = 14 * 24 * 60 * 60 * 1000;
const TOTAL_PERSISTENCE_MS = SESSION_DURATION_MS + GRACE_PERIOD_MS;

let lastTokenTimeUpdate = 0;

/**
 * Safely decodes base64 JWT payload without external dependencies
 */
export const decodeJwtPayload = (token: string): { exp?: number; id?: string; userType?: string; [key: string]: any } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const storage = {
  getToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const tokenTime = localStorage.getItem(TOKEN_TIME_KEY);

    if (!token) return null;

    // Check if token time has exceeded total persistence duration (> 44 days)
    if (tokenTime) {
      const elapsed = Date.now() - parseInt(tokenTime, 10);
      if (elapsed > TOTAL_PERSISTENCE_MS) {
        // Expired beyond all renewal grace periods
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_TIME_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ROLE_KEY);
        return null;
      }
    }

    // Throttle updating TOKEN_TIME_KEY to at most once per 60 seconds
    const now = Date.now();
    if (now - lastTokenTimeUpdate > 60000) {
      lastTokenTimeUpdate = now;
      localStorage.setItem(TOKEN_TIME_KEY, now.toString());
    }

    return token;
  },

  /**
   * Check if token will expire in less than specified buffer (default: 7 days)
   */
  isTokenExpiringSoon: (token?: string | null, bufferMs: number = 7 * 24 * 60 * 60 * 1000): boolean => {
    const t = token || localStorage.getItem(TOKEN_KEY);
    if (!t) return false;
    const payload = decodeJwtPayload(t);
    if (!payload?.exp) return false;
    const expirationTimeMs = payload.exp * 1000;
    return (expirationTimeMs - Date.now()) < bufferMs;
  },

  /**
   * Check if token is already past its exp timestamp
   */
  isTokenExpired: (token?: string | null): boolean => {
    const t = token || localStorage.getItem(TOKEN_KEY);
    if (!t) return true;
    const payload = decodeJwtPayload(t);
    if (!payload?.exp) return false;
    return payload.exp * 1000 <= Date.now();
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    const now = Date.now();
    lastTokenTimeUpdate = now;
    localStorage.setItem(TOKEN_TIME_KEY, now.toString());
  },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TIME_KEY);
  },

  getUser: (): any | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  getRole: (): string | null => {
    return localStorage.getItem(ROLE_KEY);
  },
  setRole: (role: string): void => {
    localStorage.setItem(ROLE_KEY, role);
  },

  getTheme: (): 'light' | 'dark' => {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return 'light';
  },
  setTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(THEME_KEY, theme);
  },

  hasSeenOnboarding: (): boolean => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  },
  setHasSeenOnboarding: (seen: boolean = true): void => {
    localStorage.setItem(ONBOARDING_KEY, seen ? 'true' : 'false');
  },

  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TIME_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
};
