import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { authAPI } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  googleLogin: (payload: any, userType?: string) => Promise<{ user: User; isNewUser: boolean }>;
  googleSignup: (payload: any, userType?: string) => Promise<{ user: User; isNewUser: boolean }>;
  switchRole: (targetRole?: 'client' | 'freelancer') => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setUserAndToken: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = storage.getToken();
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            storage.setUser(res.data);
          } else {
            // Invalid token
            storage.clearAll();
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error('Failed to verify token on app launch:', err);
          storage.clearAll();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const setUserAndToken = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    storage.setUser(newUser);
    storage.setToken(newToken);
    if (newUser.userType) {
      storage.setRole(newUser.userType);
    }
  };

  const login = async (email: string, password?: string): Promise<User> => {
    const res = await authAPI.signin(email, password);
    if (res.success && res.token && res.user) {
      setUserAndToken(res.user, res.token);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const googleLogin = async (payload: any, userType?: string): Promise<{ user: User; isNewUser: boolean }> => {
    const res = await authAPI.googleSignin(payload, userType);
    if (res.success && res.token && res.user) {
      setUserAndToken(res.user, res.token);
      return { user: res.user, isNewUser: !!(res as any).isNewUser };
    }
    throw new Error(res.message || 'Google Sign-In failed');
  };

  const googleSignup = async (payload: any, userType?: string): Promise<{ user: User; isNewUser: boolean }> => {
    const res = await authAPI.googleSignup(payload, userType);
    if (res.success && res.token && res.user) {
      setUserAndToken(res.user, res.token);
      return { user: res.user, isNewUser: !!(res as any).isNewUser };
    }
    throw new Error(res.message || 'Google Sign-Up failed');
  };

  const switchRole = async (targetRole?: 'client' | 'freelancer'): Promise<User> => {
    const res = await authAPI.switchRole(targetRole);
    if (res.success && res.user) {
      setUserAndToken(res.user, res.token || storage.getToken() || '');
      return res.user;
    }
    throw new Error(res.message || 'Failed to switch role');
  };

  const logout = () => {
    storage.clearAll();
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      storage.setUser(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        googleLogin,
        googleSignup,
        switchRole,
        logout,
        updateUser,
        setUserAndToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
