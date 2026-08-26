import { apiClient } from './client';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<{ success: boolean; token?: string; user?: any; message?: string }>('/api/users/signin', { email, password });
    return data;
  },
  signupWorker: async (workerData: { firstName: string; lastName: string; email: string; password: string; phoneNumber?: string; jobTitle?: string; workforceId?: string }) => {
    const { data } = await apiClient.post<{ success: boolean; token?: string; user?: any; message?: string }>('/api/users/signup', {
      ...workerData,
      userType: 'freelancer',
    });
    return data;
  },
  getMe: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/users/me');
    return data;
  },
  getPublicWorkforceInfo: async (workforceId: string) => {
    const { data } = await apiClient.get<ApiResponse>(`/api/workforce/public/${workforceId}`);
    return data;
  },
};

export const workforceAPI = {
  // Dashboard & Settings
  getDashboardStats: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/dashboard');
    return data;
  },
  getSettings: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/settings');
    return data;
  },
  saveSettings: async (settingsData: any) => {
    const { data } = await apiClient.put<ApiResponse>('/api/workforce/settings', settingsData);
    return data;
  },
  fundWallet: async (payload: { amount: number; reference?: string; paymentMethod?: string }) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/wallet/fund', payload);
    return data;
  },

  // Workers
  getWorkers: async (params?: { status?: string; search?: string; role?: string }) => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/workers', { params });
    return data;
  },
  addWorker: async (workerData: any) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/workers', workerData);
    return data;
  },
  bulkImportWorkers: async (workers: any[]) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/workers/import', { workers });
    return data;
  },
  getWorkerById: async (workerId: string) => {
    const { data } = await apiClient.get<ApiResponse>(`/api/workforce/workers/${workerId}`);
    return data;
  },
  updateWorker: async (workerId: string, workerData: any) => {
    const { data } = await apiClient.put<ApiResponse>(`/api/workforce/workers/${workerId}`, workerData);
    return data;
  },
  deleteWorker: async (workerId: string) => {
    const { data } = await apiClient.delete<ApiResponse>(`/api/workforce/workers/${workerId}`);
    return data;
  },

  // Attendance
  getAttendance: async (params?: { date?: string; startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/attendance', { params });
    return data;
  },
  recordCheckIn: async (checkInData: { workforceMemberId?: string; location?: any; notes?: string }) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/attendance/check-in', checkInData);
    return data;
  },
  recordCheckOut: async (checkOutData: { workforceMemberId?: string }) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/attendance/check-out', checkOutData);
    return data;
  },
  markAttendance: async (attendanceData: { workforceMemberId: string; date?: string; status: string; notes?: string }) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/attendance/mark', attendanceData);
    return data;
  },

  // Worker Me Experience
  getWorkerMe: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/me');
    return data;
  },
  declineContract: async (contractId: string) => {
    const { data } = await apiClient.put<ApiResponse>(`/api/workforce/contracts/${contractId}/decline`);
    return data;
  },

  // Contracts
  getContracts: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/contracts');
    return data;
  },
  createContract: async (contractData: any) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/contracts', contractData);
    return data;
  },
  acceptContract: async (contractId: string) => {
    const { data } = await apiClient.put<ApiResponse>(`/api/workforce/contracts/${contractId}/accept`);
    return data;
  },

  // Payments
  getPayments: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/payments');
    return data;
  },
  processPayment: async (paymentData: { workforceMemberId: string; amount?: number; paymentType?: string; description?: string; currency?: string }) => {
    const { data } = await apiClient.post<ApiResponse>('/api/workforce/payments', paymentData);
    return data;
  },
  updateWorkerPayoutStatus: async (workerId: string, payoutStatus: 'active' | 'frozen' | 'paused') => {
    const { data } = await apiClient.put<ApiResponse>(`/api/workforce/workers/${workerId}/payout-status`, { payoutStatus });
    return data;
  },

  // Connecta Marketplace Jobs & Proposals Integration
  getJobs: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/workforce/jobs');
    return data;
  },
  createJob: async (jobData: any) => {
    const { data } = await apiClient.post<ApiResponse>('/api/jobs', jobData);
    return data;
  },
  updateJobStatus: async (jobId: string, status: 'active' | 'closed' | 'draft') => {
    const { data } = await apiClient.put<ApiResponse>(`/api/jobs/${jobId}`, { status });
    return data;
  },
  updateJob: async (jobId: string, jobData: any) => {
    const { data } = await apiClient.put<ApiResponse>(`/api/jobs/${jobId}`, jobData);
    return data;
  },
  deleteJob: async (jobId: string) => {
    const { data } = await apiClient.delete<ApiResponse>(`/api/jobs/${jobId}`);
    return data;
  },
  applyForJob: async (jobId: string, price?: number) => {
    const { data } = await apiClient.post<ApiResponse>('/api/proposals', {
      jobId,
      price: price || 200000,
      deliveryTime: 30,
      description: 'Applied via Connecta Workforce Worker Portal 1-Tap Apply.',
    });
    return data;
  },
  getMyProposals: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/proposals/my-proposals');
    return data;
  },
  getJobApplicants: async (jobId: string) => {
    const { data } = await apiClient.get<ApiResponse>(`/api/proposals/job/${jobId}`);
    return data;
  },
  updateProposalStatus: async (proposalId: string, status: 'accepted' | 'declined') => {
    if (status === 'accepted') {
      const { data } = await apiClient.put<ApiResponse>(`/api/proposals/${proposalId}/approve`);
      return data;
    } else {
      const { data } = await apiClient.put<ApiResponse>(`/api/proposals/${proposalId}/reject`);
      return data;
    }
  },
};

export const flutterwaveAPI = {
  getBanksByCountry: async (countryCode: string = 'NG') => {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/api/payments/flutterwave/banks/${countryCode}`);
    return data;
  },
  resolveAccount: async (accountNumber: string, bankCode: string) => {
    const { data } = await apiClient.post<ApiResponse<{ accountName: string; accountNumber: string }>>('/api/payments/flutterwave/resolve-account', { accountNumber, bankCode });
    return data;
  },
};

export const notificationAPI = {
  getNotifications: async () => {
    const { data } = await apiClient.get<ApiResponse>('/api/notifications');
    return data;
  },
  getUnreadCount: async () => {
    const { data } = await apiClient.get<{ success: boolean; unreadCount?: number }>('/api/notifications/unread-count');
    return data;
  },
  markAsRead: async (notificationId: string) => {
    const { data } = await apiClient.patch<ApiResponse>(`/api/notifications/${notificationId}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await apiClient.patch<ApiResponse>('/api/notifications/mark-all-read');
    return data;
  },
};
