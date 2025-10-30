const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getJobById = async (jobId: string) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  if (!response.ok) throw new Error('Failed to fetch job');
  return response.json();
};
