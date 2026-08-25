import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/workforce';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'client' | 'freelancer' | 'admin';
  companyName?: string;
  title?: string;
  phone?: string;
  location?: string;
  currency?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signupWorker: (workerData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('connecta_token') || localStorage.getItem('workforce_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      if (res?.data) {
        setUser(res.data);
      }
    } catch {
      localStorage.removeItem('connecta_token');
      localStorage.removeItem('workforce_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await authAPI.login(email, pass);
    if (res.token && res.user) {
      localStorage.setItem('connecta_token', res.token);
      localStorage.setItem('workforce_token', res.token);
      setUser(res.user);
      return true;
    }
    return false;
  };

  const signupWorker = async (workerData: any) => {
    const res = await authAPI.signupWorker(workerData);
    if (res.success) {
      // Auto signin
      return await login(workerData.email, workerData.password);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('connecta_token');
    localStorage.removeItem('workforce_token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signupWorker, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
