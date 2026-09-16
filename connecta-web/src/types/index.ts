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
  country?: string;
  currency?: string;
  workType?: 'freelancing' | 'permanent';
  companyName?: string;
  website?: string;
  termsAccepted?: boolean;
  resume?: string;
  cv?: string;
  education?: Array<{ school: string; degree: string; fieldOfStudy?: string; year?: string }>;
  workExperience?: Array<{ role: string; company: string; period: string; description: string }>;
  languages?: string[];
  portfolio?: Array<{ title: string; category?: string; image?: string; link?: string; description?: string }>;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
  exists?: boolean;
  available?: boolean;
  normalizedPhone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
