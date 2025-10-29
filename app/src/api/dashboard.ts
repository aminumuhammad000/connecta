const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard stats
  getStats: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Get top freelancers
  getFreelancers: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/dashboard/freelancers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch freelancers');
    return response.json();
  },

  // Get recent messages
  getMessages: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/dashboard/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },
};
