const TOKEN_KEY = 'connecta_token';
const TOKEN_TIME_KEY = 'connecta_token_time';
const USER_KEY = 'connecta_user';
const ROLE_KEY = 'connecta_role';
const THEME_KEY = 'connecta_theme';
const ONBOARDING_KEY = 'connecta_onboarding_completed';

// 30 days in milliseconds (1 month session durability)
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export const storage = {
  getToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const tokenTime = localStorage.getItem(TOKEN_TIME_KEY);

    if (!token) return null;

    // Check if token has expired (> 30 days)
    if (tokenTime) {
      const elapsed = Date.now() - parseInt(tokenTime, 10);
      if (elapsed > SESSION_DURATION_MS) {
        // Expired after 30 days
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_TIME_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ROLE_KEY);
        return null;
      }
    }

    // Continuously extend active user session timestamp on usage
    localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
    return token;
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
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
