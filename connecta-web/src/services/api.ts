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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for handling errors & silent token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/api/users/signin') ||
      originalRequest?.url?.includes('/api/users/signup') ||
      originalRequest?.url?.includes('/api/users/google/') ||
      originalRequest?.url?.includes('/api/users/refresh-token');

    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest?._retry) {
      const storedToken = storage.getToken();
      if (storedToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post<ApiResponse<{ user: User; token: string }>>(
            `${API_BASE_URL}/api/users/refresh-token`,
            { token: storedToken },
            { headers: { Authorization: `Bearer ${storedToken}` } }
          );

          if (res.data?.success && res.data?.token) {
            const newToken = res.data.token;
            storage.setToken(newToken);
            if (res.data.user) {
              storage.setUser(res.data.user);
            }
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          const isPublicPage = window.location.pathname.includes('/login') ||
            window.location.pathname.includes('/register') ||
            window.location.pathname === '/' ||
            window.location.pathname === '/landing' ||
            window.location.pathname.startsWith('/jobs');

          if (!isPublicPage) {
            storage.clearAll();
            window.location.href = '/login?expired=1';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
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

  googleSignin: async (payload: any, userType?: string) => {
    const body = typeof payload === 'string'
      ? { tokenId: payload, userType }
      : { ...payload, userType: payload.userType || userType };
    const { data } = await apiClient.post<ApiResponse>('/api/users/google/signin', body);
    return data;
  },

  googleSignup: async (payload: any, userType?: string) => {
    const body = typeof payload === 'string'
      ? { tokenId: payload, userType }
      : { ...payload, userType: payload.userType || userType };
    const { data } = await apiClient.post<ApiResponse>('/api/users/google/signup', body);
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
    const { data } = await apiClient.get<ApiResponse<User & { token?: string }>>('/api/users/me');
    return data;
  },

  refreshToken: async (customToken?: string) => {
    const token = customToken || storage.getToken();
    const { data } = await axios.post<ApiResponse<{ user: User; token: string }>>(
      `${API_BASE_URL}/api/users/refresh-token`,
      { token },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return data;
  },

  updateMe: async (profileData: Partial<User> & Record<string, any>) => {
    const { data } = await apiClient.put<ApiResponse<User>>('/api/users/me', profileData);
    return data;
  },

  switchRole: async (targetRole?: 'client' | 'freelancer') => {
    const { data } = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/api/users/switch-type', { userType: targetRole });
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

  requestCurrencyOtp: async () => {
    const { data } = await apiClient.post<ApiResponse>('/api/users/currency/request-otp');
    return data;
  },

  changeCurrencyWithOtp: async (payload: { newCurrency: string; country?: string; otp: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/users/currency/change-with-otp', payload);
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
  },

  getUserContracts: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/contracts');
    return data;
  },

  getContractById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/api/contracts/${id}`);
    return data;
  },

  submitWork: async (id: string, payload: { summary: string; files?: string[] }) => {
    const { data } = await apiClient.post<ApiResponse>(`/api/contracts/submit/${id}`, payload);
    return data;
  },

  approveWork: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse>(`/api/contracts/approve/${id}`);
    return data;
  },

  acceptOffer: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse>(`/api/contracts/accept/${id}`);
    return data;
  }
};

export const contractAPI = {
  createOffer: authAPI.createOffer,
  getUserContracts: authAPI.getUserContracts,
  getContractById: authAPI.getContractById,
  submitWork: authAPI.submitWork,
  approveWork: authAPI.approveWork,
  acceptOffer: authAPI.acceptOffer,
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
  submitProposal: async (proposalData: { jobId: string; coverLetter?: string; description?: string; bidAmount?: number; price?: number; estimatedDays?: number; deliveryTime?: number }) => {
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
  },
  updateProposal: async (id: string, proposalData: { coverLetter?: string; description?: string; bidAmount?: number; price?: number; estimatedDays?: number; deliveryTime?: number }) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/api/proposals/${id}`, proposalData);
    return data;
  },
  withdrawProposal: async (id: string) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/api/proposals/${id}/withdraw`, {});
    return data;
  }
};

// Saved Jobs API service
export const savedJobAPI = {
  getSavedJobs: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/jobs/saved/all');
    return data;
  },
  saveJob: async (jobId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/jobs/${jobId}/save`, {});
    return data;
  },
  removeSavedJob: async (jobId: string) => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/api/jobs/${jobId}/save`);
    return data;
  }
};

// Contact & Support Ticket API service
export const contactAPI = {
  getPublicContact: async () => {
    const { data } = await apiClient.get<ApiResponse<{
      email: string;
      phone: string;
      whatsapp: string;
      supportHours: string;
      supportChannel: string;
      address: string;
    }>>('/api/settings/contact');
    return data;
  },
  submitContact: async (ticketData: {
    name?: string;
    email?: string;
    subject: string;
    message: string;
    category?: string;
    priority?: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/contact', ticketData);
    return data;
  },
  getMyTickets: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/contact/my-tickets');
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
  },
  saveWithdrawalSettings: async (settings: { accountName: string; accountNumber: string; bankName: string; bankCode: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/payments/wallet/settings', settings);
    return data;
  }
};

// Flutterwave Multi-Currency API service
export const flutterwaveAPI = {
  initializeDeposit: async (amount: number, currency: string) => {
    const { data } = await apiClient.post<ApiResponse<{ link: string; txRef: string }>>('/api/payments/flutterwave/initialize', { amount, currency });
    return data;
  },
  getBanksByCountry: async (countryCode: string) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/payments/flutterwave/banks/${countryCode}`);
    return data;
  },
  resolveAccount: async (accountNumber: string, bankCode: string) => {
    const { data } = await apiClient.post<ApiResponse<{ accountName: string; accountNumber: string }>>('/api/payments/flutterwave/resolve-account', { accountNumber, bankCode });
    return data;
  },
  requestWithdrawal: async (withdrawalData: { amount: number; currency: string; bankCode: string; accountNumber: string; accountName: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/payments/flutterwave/withdraw', withdrawalData);
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
  createPost: async (postData: { title?: string; body?: string; imageUrl?: string; actorName?: string; actorRole?: string; actorAvatar?: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/feed/create', postData);
    return data;
  },
  editPost: async (postId: string, postData: { title?: string; body?: string }) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/api/feed/${postId}`, postData);
    return data;
  },
  deletePost: async (postId: string) => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/api/feed/${postId}`);
    return data;
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<any>>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  reactToPost: async (postId: string, reactionType = 'like') => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/feed/${postId}/react`, { reaction: reactionType, type: reactionType });
    return data;
  },
  addComment: async (postId: string, text: string, parentCommentId?: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/feed/${postId}/comments`, { text, content: text, parentCommentId });
    return data;
  },
  votePoll: async (postId: string, optionIndex: number) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/feed/${postId}/poll/vote`, { optionIndex });
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
  },

  summarizeProposal: async (proposalData: { coverLetter?: string; description?: string; bidAmount?: number; estimatedDays?: number }) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/ai/summarize-proposal', proposalData);
    return data;
  },

  matchTalent: async (jobId: string) => {
    const { data } = await apiClient.post<ApiResponse<any[]>>('/api/ai/match-talent', { jobId });
    return data;
  },

  getRecommendedJobs: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/api/ai/recommended-jobs');
    return data;
  },

  quickApply: async (jobId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/ai/quick-apply', { jobId });
    return data;
  },

  generateProposal: async (jobId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/ai/quick-apply', { jobId });
    return data;
  },

  parseCv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<any>>('/api/ai/parse-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};

// Currency API service
export const currencyAPI = {
  getCurrencies: async (activeOnly: boolean = true) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/currencies?activeOnly=${activeOnly}`);
    return data;
  },
  createCurrency: async (currencyData: any) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/currencies', currencyData);
    return data;
  },
  updateCurrency: async (id: string, currencyData: any) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/api/currencies/${id}`, currencyData);
    return data;
  },
  toggleCurrencyStatus: async (id: string) => {
    const { data } = await apiClient.patch<ApiResponse<any>>(`/api/currencies/${id}/toggle`);
    return data;
  },
  deleteCurrency: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/api/currencies/${id}`);
    return data;
  },
};

// AI Interview API service
export const aiInterviewAPI = {
  start: async (proposalId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/api/ai/interview/start', { proposalId });
    return data;
  },

  submitAnswer: async (interviewId: string, payload: { questionId: string; question?: string; answerText: string; audioUrl?: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/ai/interview/${interviewId}/answer`, payload);
    return data;
  },

  complete: async (interviewId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/ai/interview/${interviewId}/complete`);
    return data;
  },

  getByProposalId: async (proposalId: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/api/ai/interview/proposal/${proposalId}`);
    return data;
  }
};


