const TOKEN_KEY = 'connecta_token';
const USER_KEY = 'connecta_user';
const ROLE_KEY = 'connecta_role';
const THEME_KEY = 'connecta_theme';
const ONBOARDING_KEY = 'connecta_onboarding_completed';

export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
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
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
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
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
};
