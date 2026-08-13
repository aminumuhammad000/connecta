import axios, { type AxiosResponse } from 'axios';
import { storage } from '../utils/storage';
import type { ApiResponse, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.myconnecta.ng';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors (e.g. 401 auto logout)
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        storage.clearAll();
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API service
export const authAPI = {
  checkEmail: async (email: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/check-email', { email });
    return data;
  },

  checkPhone: async (phoneNumber: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/check-phone', { phoneNumber });
    return data;
  },

  initiateSignup: async (email: string, firstName?: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/initiate-signup', { email, firstName });
    return data;
  },

  signup: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    whatsapp?: string;
    userType: 'client' | 'freelancer';
    skills?: string[];
  }) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/signup', userData);
    return data;
  },

  signin: async (email: string, password?: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/signin', { email, password });
    return data;
  },

  googleSignin: async (googleToken: string, userType?: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/google/signin', { token: googleToken, userType });
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/forgot-password', { email });
    return data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/verify-otp', { email, otp });
    return data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/reset-password', { email, otp, newPassword });
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get<ApiResponse<User>>('/api/users/me');
    return data;
  },

  updateMe: async (profileData: Partial<User> & Record<string, any>) => {
    const { data } = await apiClient.put<ApiResponse<User>>('/api/users/me', profileData);
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/change-password', { currentPassword, newPassword });
    return data;
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>('/api/uploads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  resendVerification: async () => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/resend-verification');
    return data;
  },

  verifyEmail: async (token: string) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/verify-email', { token });
    return data;
  },

  requestVerification: async (payload: { githubUrl?: string; portfolioUrl?: string; skillProofs?: string }) => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/request-verification', payload);
    return data;
  },

  getVettedTalent: async (tier?: string) => {
    const { data } = await apiClient.get<ApiResponse>('/api/users/vetted-talent', { params: { tier } });
    return data;
  },

  getFreelancers: async (params?: { search?: string; skills?: string; limit?: number }) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/users/freelancers', { params });
    return data;
  },

  getUserById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/api/users/${id}`);
    return data;
  },

  createOffer: async (offerData: any) => {
    const { data } = await apiClient.post<ApiResponse>('/api/contracts/offer', offerData);
    return data;
  }
};

// Jobs API service
export const jobAPI = {
  getRecommendedJobs: async (limit: number = 20) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/jobs/recommended?limit=${limit}`);
    return data;
  },

  getAllJobs: async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/jobs', { params });
    return data;
  },

  getClientJobs: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/jobs/client/my-jobs');
    return data;
  },

  getRecommendedFreelancers: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/dashboard/recommended-freelancers');
    return data;
  },

  inviteFreelancer: async (jobId: string, freelancerId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/jobs/${jobId}/invite`, { freelancerId });
    return data;
  },

  getJobById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/api/jobs/${id}`);
    return data;
  },

  createJob: async (jobData: any) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/jobs', jobData);
    return data;
  }
};

// Projects API service
export const projectAPI = {
  getClientProjects: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/projects/client/my-projects');
    return data;
  },
  getFreelancerProjects: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/projects/freelancer/my-projects');
    return data;
  },
  getProjectById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/api/projects/${id}`);
    return data;
  }
};

// Proposals API service
export const proposalAPI = {
  getMyProposals: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/proposals/my-proposals');
    return data;
  },
  getProposalById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/api/proposals/${id}`);
    return data;
  },
  getProposalsByJobId: async (jobId: string) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/proposals/job/${jobId}`);
    return data;
  },
  submitProposal: async (proposalData: { jobId: string; coverLetter: string; bidAmount: number; estimatedDays: number }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/proposals', proposalData);
    return data;
  },
  acceptProposal: async (id: string) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/api/proposals/${id}/accept`, {});
    return data;
  },
  rejectProposal: async (id: string) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/api/proposals/${id}/reject`, {});
    return data;
  }
};

// Wallet API service
export const walletAPI = {
  getWallet: async () => {
    const { data } = await apiClient.get<ApiResponse<any>>('/api/payments/wallet/balance');
    return data;
  },
  getTransactions: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/payments/transactions');
    return data;
  },
  getVirtualAccount: async () => {
    const { data } = await apiClient.get<ApiResponse<any>>('/api/payments/vtstack/virtual-account');
    return data;
  },
  initializeTopup: async (amount: number) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/payments/initialize-topup', { amount });
    return data;
  },
  requestWithdrawal: async (withdrawalData: { amount: number; bankDetails: { bankName: string; accountNumber: string; accountName: string } }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/payments/withdrawal/request', withdrawalData);
    return data;
  }
};

// Messages API service
export const messageAPI = {
  getConversations: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/messages/conversations');
    return data;
  },
  getOrCreateConversation: async (payload: { participants?: string[]; clientId?: string; freelancerId?: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/messages/conversations', payload);
    return data;
  },
  getMessages: async (conversationId: string) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/messages/conversations/${conversationId}/messages`);
    return data;
  },
  sendMessage: async (conversationId: string, text: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/messages/message/send', { conversationId, text, content: text });
    return data;
  }
};

export const feedAPI = {
  getFeed: async (limit = 20, page = 1) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/feed?limit=${limit}&page=${page}`);
    return data;
  },
  createPost: async (postData: { title: string; body: string; actorName?: string; actorRole?: string; actorAvatar?: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/feed/create', postData);
    return data;
  },
  reactToPost: async (postId: string, reactionType = 'like') => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/feed/${postId}/react`, { type: reactionType });
    return data;
  },
  addComment: async (postId: string, text: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/feed/${postId}/comments`, { content: text });
    return data;
  }
};

// Review API service
export const reviewAPI = {
  createReview: async (reviewData: { projectId?: string; revieweeId: string; reviewerType: string; rating: number; comment: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/reviews', reviewData);
    return data;
  },
  getUserReviews: async (userId: string) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/reviews/user/${userId}`);
    return data;
  }
};

// Notification API service
export const notificationAPI = {
  /** Fetch paginated notifications for the current user */
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(
      `/api/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
    );
    return data;
  },

  /** Get unread notification count */
  getUnreadCount: async () => {
    const { data } = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/api/notifications/unread-count');
    return data;
  },

  /** Mark a single notification as read */
  markAsRead: async (notificationId: string) => {
    const { data } = await apiClient.patch<ApiResponse<any>>(`/api/notifications/${notificationId}/read`);
    return data;
  },

  /** Mark all notifications as read */
  markAllAsRead: async () => {
    const { data } = await apiClient.patch<ApiResponse<any>>('/api/notifications/mark-all-read');
    return data;
  },

  /** Delete a single notification */
  deleteNotification: async (notificationId: string) => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/api/notifications/${notificationId}`);
    return data;
  },

  /** Clear all read notifications */
  clearRead: async () => {
    const { data } = await apiClient.delete<ApiResponse<any>>('/api/notifications/clear-read');
    return data;
  }
};

// AI Assistant API service
export const aiAPI = {
  chat: async (message: string, messagesHistory: any[]) => {
    const { data } = await apiClient.post<ApiResponse<{ reply: string; userContext?: any }>>('/api/ai/chat', {
      message,
      messages: messagesHistory
    });
    return data;
  }
};
