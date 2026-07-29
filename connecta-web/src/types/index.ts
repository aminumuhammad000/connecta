export type UserRole = 'client' | 'freelancer' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserRole;
  phoneNumber?: string;
  whatsapp?: string;
  profileImage?: string;
  isVerified?: boolean;
  isActive?: boolean;
  preferredLanguage?: 'en' | 'ha';
  skills?: string[];
  bio?: string;
  title?: string;
  location?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  portfolioLinks?: string[];
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
