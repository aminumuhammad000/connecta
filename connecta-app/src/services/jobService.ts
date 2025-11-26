import { get, post, put } from './api';
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
    return response.data!;
};

/**
 * Get client's jobs
 */
export const getMyJobs = async (): Promise<Job[]> => {
    const response = await get<Job[]>(API_ENDPOINTS.MY_JOBS);
    return response.data!;
};

/**
 * Get recommended jobs
 */
export const getRecommendedJobs = async (): Promise<Job[]> => {
    const response = await get<Job[]>(API_ENDPOINTS.RECOMMENDED_JOBS);
    return response.data!;
};

/**
 * Search jobs
 */
export const searchJobs = async (query: string): Promise<Job[]> => {
    const response = await get<Job[]>(API_ENDPOINTS.JOB_SEARCH, { q: query });
    return response.data!;
};

/**
 * Get job by ID
 */
export const getJobById = async (id: string): Promise<Job> => {
    const response = await get<Job>(API_ENDPOINTS.JOB_BY_ID(id));
    return response.data!;
};

/**
 * Create new job
 */
export const createJob = async (jobData: Partial<Job>): Promise<Job> => {
    const response = await post<Job>(API_ENDPOINTS.JOBS, jobData);
    return response.data!;
};

/**
 * Update job
 */
export const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job> => {
    const response = await put<Job>(API_ENDPOINTS.JOB_BY_ID(id), jobData);
    return response.data!;
};

export default {
    getAllJobs,
    getMyJobs,
    getRecommendedJobs,
    searchJobs,
    getJobById,
    createJob,
    updateJob,
};
