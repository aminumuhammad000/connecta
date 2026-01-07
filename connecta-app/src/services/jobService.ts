import { get, post, put, del } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Job } from '../types';

/**
 * Job Service
 * Handles job-related API calls
 */

/**
 * Get all jobs with optional filters
 */
export const getAllJobs = async (params?: {
    category?: string;
    skills?: string;
    jobType?: string;
    limit?: number;
    page?: number;
}): Promise<Job[]> => {
    const response = await get<Job[]>(API_ENDPOINTS.JOBS, params);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get client's jobs
 */
export const getMyJobs = async (): Promise<Job[]> => {
    const response = await get<Job[]>(API_ENDPOINTS.MY_JOBS);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get recommended jobs
 */
export const getRecommendedJobs = async (limit: number = 10): Promise<Job[]> => {
    const response = await get<Job[]>(`${API_ENDPOINTS.RECOMMENDED_JOBS}?limit=${limit}`);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Search jobs
 */
export const searchJobs = async (query: string): Promise<Job[]> => {
    const response = await get<Job[]>(API_ENDPOINTS.JOB_SEARCH, { q: query });
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get job by ID
 */
export const getJobById = async (id: string): Promise<Job> => {
    const response = await get<Job>(API_ENDPOINTS.JOB_BY_ID(id));
    return (response as any)?.data || response;
};

/**
 * Create new job
 */
export const createJob = async (jobData: Partial<Job>): Promise<Job> => {
    const response = await post<Job>(API_ENDPOINTS.JOBS, jobData);
    return (response as any)?.data || response;
};

/**
 * Update job
 */
export const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job> => {
    const response = await put<Job>(API_ENDPOINTS.JOB_BY_ID(id), jobData);
    return (response as any)?.data || response;
};

/**
 * Get Saved Jobs
 */
export const getSavedJobs = async (): Promise<Job[]> => {
    const response = await get<Job[]>(`${API_ENDPOINTS.JOBS}/saved`);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Save Job
 */
export const saveJob = async (id: string): Promise<any> => {
    return await post(`${API_ENDPOINTS.JOBS}/${id}/save`, {});
};

/**
 * Unsave Job
 */
export const unsaveJob = async (id: string): Promise<any> => {
    return await del(`${API_ENDPOINTS.JOBS}/${id}/save`);
};

export default {
    getAllJobs,
    getMyJobs,
    getRecommendedJobs,
    searchJobs,
    getJobById,
    createJob,
    updateJob,
    getSavedJobs, // Export new method
    saveJob,      // Export new method
    unsaveJob,    // Export new method
};
