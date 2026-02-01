import { API_BASE_URL } from "../utils/constants";

export const getJobById = async (jobId: string) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  if (!response.ok) throw new Error('Failed to fetch job');
  return response.json();
};
