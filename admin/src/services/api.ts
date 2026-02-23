import axios, { type AxiosResponse } from 'axios'

// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
}

// API Base Configuration
// Use 'http://localhost:5000' for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.myconnecta.ng'
console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Return the full response object to maintain proper typing
    return response
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method
    })

    if (error.response?.status === 401) {
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.warn('Unauthorized - clearing auth and redirecting to login')
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTHENTICATION
// ============================================
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/api/users/signin', { email, password })
    return data
  },
  signup: async (userData: any) => {
    const { data } = await api.post('/api/users/signup', userData)
    return data
  },
  getProfile: async () => {
    const { data } = await api.get('/api/users/me')
    return data
  },
  updateProfile: async (profileData: any) => {
    const { data } = await api.put('/api/users/me', profileData)
    return data
  },
  changePassword: async (passwordData: any) => {
    const { data } = await api.post('/api/users/change-password', passwordData)
    return data
  },
}

// ============================================
// USERS
// ============================================
export const usersAPI = {
  getAll: async (params?: { userType?: string; skills?: string; limit?: number; page?: number; search?: string }) => {
    const { data } = await api.get('/api/users', { params })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/api/users/${id}`)
    return data
  },
  update: async (id: string, userData: any) => {
    const { data } = await api.put(`/api/users/${id}`, userData)
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/users/${id}`)
    return data
  },
  ban: async (id: string) => {
    const { data } = await api.put(`/api/users/${id}/ban`)
    return data
  },
  unban: async (id: string) => {
    const { data } = await api.put(`/api/users/${id}/unban`)
    return data
  },
}

// ============================================
// CONTRACTS
// ============================================
export const contractsAPI = {
  getAll: async (params?: { status?: string; search?: string; limit?: number; page?: number }) => {
    const { data } = await api.get('/api/contracts/admin/all', { params })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/api/contracts/${id}`)
    return data
  },
  create: async (contractData: any) => {
    const { data } = await api.post('/api/contracts', contractData)
    return data
  },
  sign: async (id: string, signatureData: any) => {
    const { data } = await api.post(`/api/contracts/${id}/sign`, signatureData)
    return data
  },
  terminate: async (id: string, reason: string) => {
    const { data } = await api.post(`/api/contracts/${id}/terminate`, { reason })
    return data
  },
  getTemplate: async (type: string) => {
    const { data } = await api.get(`/api/contracts/templates/${type}`)
    return data
  },
}

// ============================================
// PROJECTS
// ============================================
export const projectsAPI = {
  getAll: async (params?: { status?: string; search?: string; limit?: number; page?: number; userId?: string }) => {
    const { data } = await api.get('/api/projects', { params })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/api/projects/${id}`)
    return data
  },
  getByFreelancer: async (freelancerId: string) => {
    const { data } = await api.get(`/api/projects/freelancer/${freelancerId}`)
    return data
  },
  getByClient: async (clientId: string) => {
    const { data } = await api.get(`/api/projects/client/${clientId}`)
    return data
  },
  getStats: async (userId: string) => {
    const { data } = await api.get(`/api/projects/stats/${userId}`)
    return data
  },
  create: async (projectData: any) => {
    const { data } = await api.post('/api/projects', projectData)
    return data
  },
  update: async (id: string, projectData: any) => {
    const { data } = await api.put(`/api/projects/${id}`, projectData)
    return data
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/api/projects/${id}/status`, { status })
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/projects/${id}`)
    return data
  },
}

// ============================================
// JOBS
// ============================================
export const jobsAPI = {
  getAll: async (params?: { status?: string; search?: string; limit?: number; page?: number }) => {
    const { data } = await api.get('/api/jobs', { params })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/api/jobs/${id}`)
    return data
  },
  getMyJobs: async () => {
    const { data } = await api.get('/api/jobs/client/my-jobs')
    return data
  },
  search: async (query: string) => {
    const { data } = await api.get('/api/jobs/search', { params: { q: query } })
    return data
  },
  create: async (jobData: any) => {
    const { data } = await api.post('/api/jobs', jobData)
    return data
  },
  update: async (id: string, jobData: any) => {
    const { data } = await api.put(`/api/jobs/${id}`, jobData)
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/jobs/${id}`)
    return data
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/api/jobs/${id}/status`, { status })
    return data
  },
}

// ============================================
// PROPOSALS
// ============================================
export const proposalsAPI = {
  getAll: async (params?: { status?: string; search?: string; limit?: number; page?: number; userId?: string }) => {
    const { data } = await api.get('/api/proposals', { params })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/api/proposals/${id}`)
    return data
  },
  getByFreelancer: async (freelancerId: string) => {
    const { data } = await api.get(`/api/proposals/freelancer/${freelancerId}`)
    return data
  },
  getStats: async (freelancerId: string) => {
    const { data } = await api.get(`/api/proposals/stats/${freelancerId}`)
    return data
  },
  create: async (proposalData: any) => {
    const { data } = await api.post('/api/proposals', proposalData)
    return data
  },
  approve: async (id: string) => {
    const { data } = await api.put(`/api/proposals/${id}/approve`)
    return data
  },
  reject: async (id: string) => {
    const { data } = await api.put(`/api/proposals/${id}/reject`)
    return data
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/api/proposals/${id}/status`, { status })
    return data
  },
  update: async (id: string, proposalData: any) => {
    const { data } = await api.put(`/api/proposals/${id}`, proposalData)
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/proposals/${id}`)
    return data
  },
}

// ============================================
// PAYMENTS
// ============================================
export const paymentsAPI = {
  getAll: async (params?: { status?: string; userId?: string; limit?: number; page?: number }) => {
    const { data } = await api.get('/api/payments/admin/all', { params })
    return data
  },
  getHistory: async (params?: { limit?: number; page?: number }) => {
    const { data } = await api.get('/api/payments/history', { params })
    return data
  },
  getStats: async () => {
    // Calculate stats from all payments
    const { data: response } = await api.get('/api/payments/admin/all')
    const payments = Array.isArray(response) ? response : response?.data || []

    const totalRevenue = payments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

    const pendingWithdrawals = payments
      .filter((p: any) => p.status === 'pending')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

    const successfulTransactions = payments.filter((p: any) => p.status === 'completed').length

    return { totalRevenue, pendingWithdrawals, successfulTransactions }
  },
  release: async (paymentId: string) => {
    const { data } = await api.post(`/api/payments/${paymentId}/release`)
    return data
  },
  refund: async (paymentId: string) => {
    const { data } = await api.post(`/api/payments/${paymentId}/refund`)
    return data
  },
  getWalletBalance: async () => {
    const { data } = await api.get('/api/payments/wallet/balance')
    return data
  },
  getTransactions: async (params?: { limit?: number; page?: number }) => {
    const { data } = await api.get('/api/payments/transactions', { params })
    return data
  },
  requestWithdrawal: async (withdrawalData: any) => {
    const { data } = await api.post('/api/payments/withdrawal/request', withdrawalData)
    return data
  },
  processWithdrawal: async (withdrawalId: string) => {
    const { data } = await api.post(`/api/payments/withdrawal/${withdrawalId}/process`)
    return data
  },
  getAllWithdrawals: async (params?: { status?: string; limit?: number; page?: number }) => {
    const { data } = await api.get('/api/payments/admin/withdrawals/all', { params })
    return data
  },
  getAllWallets: async (params?: { limit?: number; page?: number }) => {
    const { data } = await api.get('/api/payments/admin/wallets/all', { params })
    return data
  },
}

// ============================================
// NOTIFICATIONS
// ============================================
export const notificationsAPI = {
  getAll: async (params?: { limit?: number; page?: number }) => {
    const { data } = await api.get('/api/notifications/admin/all', { params })
    return data
  },
  getUnreadCount: async () => {
    const { data } = await api.get('/api/notifications/unread-count')
    return data
  },
  markAsRead: async (id: string) => {
    const { data } = await api.patch(`/api/notifications/${id}/read`)
    return data
  },
  markAllAsRead: async () => {
    const { data } = await api.patch('/api/notifications/mark-all-read')
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/notifications/${id}`)
    return data
  },
  clearRead: async () => {
    const { data } = await api.delete('/api/notifications/clear-read')
    return data
  },
}

// ============================================
// REVIEWS
// ============================================
export const reviewsAPI = {
  getAll: async () => {
    const { data } = await api.get('/api/reviews/admin/all')
    return data
  },
  create: async (reviewData: any) => {
    const { data } = await api.post('/api/reviews', reviewData)
    return data
  },
  getByUser: async (userId: string) => {
    const { data } = await api.get(`/api/reviews/user/${userId}`)
    return data
  },
  getStats: async (userId: string) => {
    const { data } = await api.get(`/api/reviews/user/${userId}/stats`)
    return data
  },
  respond: async (reviewId: string, response: string) => {
    const { data } = await api.post(`/api/reviews/${reviewId}/respond`, { response })
    return data
  },
  vote: async (reviewId: string, vote: 'helpful' | 'not_helpful') => {
    const { data } = await api.post(`/api/reviews/${reviewId}/vote`, { vote })
    return data
  },
  flag: async (reviewId: string, reason: string) => {
    const { data } = await api.post(`/api/reviews/${reviewId}/flag`, { reason })
    return data
  },
  update: async (reviewId: string, reviewData: any) => {
    const { data } = await api.put(`/api/reviews/${reviewId}`, reviewData)
    return data
  },
}

// ============================================
// DASHBOARD
// ============================================
export const dashboardAPI = {
  getStats: async () => {
    const { data } = await api.get('/api/dashboard/admin/stats')
    return data
  },
  getFreelancers: async () => {
    const { data } = await api.get('/api/dashboard/freelancers')
    return data
  },
  getMessages: async () => {
    const { data } = await api.get('/api/dashboard/messages')
    return data
  },
}

// ============================================
// ANALYTICS
// ============================================
export const analyticsAPI = {
  getStats: async () => {
    const { data } = await api.get('/api/analytics/stats')
    return data
  },
}

// ============================================
// SUBSCRIPTIONS
// ============================================
export const subscriptionsAPI = {
  getAll: async () => {
    const response = await api.get('/api/subscriptions/admin/all')
    return response.data
  },
  getStats: async () => {
    const response = await api.get('/api/subscriptions/admin/stats')
    return response.data
  },
  cancel: async (subscriptionId: string) => {
    const response = await api.patch(`/api/subscriptions/${subscriptionId}/cancel`)
    return response.data
  },
  reactivate: async (subscriptionId: string) => {
    const response = await api.patch(`/api/subscriptions/${subscriptionId}/reactivate`)
    return response.data
  },
  delete: async (subscriptionId: string) => {
    const response = await api.delete(`/api/subscriptions/${subscriptionId}`)
    return response.data
  },
}

// ============================================
// PROFILES
// ============================================
export const profilesAPI = {
  create: async (profileData: any) => {
    const { data } = await api.post('/api/profiles', profileData)
    return data
  },
  getAll: async (params?: any) => {
    const { data } = await api.get('/api/profiles', { params })
    return data
  },
  getMe: async () => {
    const { data } = await api.get('/api/profiles/me')
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/api/profiles/${id}`)
    return data
  },
  getByUserId: async (userId: string) => {
    const { data } = await api.get(`/api/profiles/user/${userId}`)
    return data
  },
  update: async (id: string, profileData: any) => {
    const { data } = await api.put(`/api/profiles/${id}`, profileData)
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/profiles/${id}`)
    return data
  },
}

// ============================================
// FILE UPLOADS
// ============================================
export const uploadsAPI = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/uploads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}

// ============================================
// SETTINGS
// ============================================
export const settingsAPI = {
  get: async () => {
    const { data } = await api.get('/api/settings')
    return data
  },
  updateSmtp: async (smtpData: any) => {
    const { data } = await api.put('/api/settings/smtp', smtpData)
    return data
  },
  updateApiKeys: async (apiKeysData: any) => {
    const { data } = await api.put('/api/settings/api-keys', apiKeysData)
    return data
  },
}

// ============================================
// BROADCAST
// ============================================
export const broadcastAPI = {
  sendEmail: async (broadcastData: {
    recipientType: 'all' | 'selected' | 'individual'
    subject: string
    body: string
    selectedUserIds?: string[]
    individualEmail?: string
  }) => {
    const { data } = await api.post('/api/broadcast/email', broadcastData)
    return data
  },
}

// VERIFICATIONS
// ============================================
export const verificationsAPI = {
  getAll: async (params?: { status?: string }) => {
    const { data } = await api.get('/api/verifications/all', { params })
    return data
  },
  updateStatus: async (id: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    const { data } = await api.put(`/api/verifications/${id}/status`, { status, adminNotes })
    return data
  }
}

// ============================================
// CONTACT MESSAGES
// ============================================
export const contactAPI = {
  getAll: async () => {
    const { data } = await api.get('/api/contact')
    return data
  },
}

export default api
