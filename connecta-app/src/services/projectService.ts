import { get, post, patch, uploadFile } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Project } from '../types';

/**
 * Project Service
 * Handles project-related API calls
 */

/**
 * Get client's projects
 */
export const getMyProjects = async (): Promise<Project[]> => {
    const response = await get<Project[]>(API_ENDPOINTS.MY_PROJECTS);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get projects for a specific freelancer
 */
export const getFreelancerProjects = async (freelancerId: string): Promise<Project[]> => {
    const response = await get<Project[]>(API_ENDPOINTS.FREELANCER_PROJECTS(freelancerId));
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get projects for a specific client
 */
export const getClientProjects = async (clientId: string): Promise<Project[]> => {
    const response = await get<Project[]>(API_ENDPOINTS.CLIENT_PROJECTS(clientId));
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get project statistics
 */
export const getProjectStats = async (userId: string): Promise<any> => {
    const response = await get(API_ENDPOINTS.PROJECT_STATS(userId));
    return (response as any)?.data || response;
};

/**
 * Get project by ID
 */
export const getProjectById = async (id: string): Promise<Project> => {
    const response = await get<Project>(API_ENDPOINTS.PROJECT_BY_ID(id));
    return (response as any)?.data || response;
};

/**
 * Create new project
 */
export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    const response = await post<Project>(API_ENDPOINTS.PROJECTS, projectData);
    return (response as any)?.data || response;
};

/**
 * Update project status
 */
export const updateProjectStatus = async (id: string, status: string): Promise<Project> => {
    const response = await patch<Project>(API_ENDPOINTS.PROJECT_BY_ID(id) + '/status', { status });
    return (response as any)?.data || response;
};

/**
 * Add file upload to project
 */
/**
 * Add file upload to project
 */
export const uploadProjectFile = async (id: string, fileData: any): Promise<any> => {
    const response = await post(API_ENDPOINTS.PROJECT_UPLOAD(id), fileData);
    return (response as any)?.data || response;
};

/**
 * Add activity to project
 */
export const addProjectActivity = async (id: string, activityData: any): Promise<any> => {
    const response = await post(API_ENDPOINTS.PROJECT_ACTIVITY(id), activityData);
    return (response as any)?.data || response;
};

export default {
    getMyProjects,
    getFreelancerProjects,
    getClientProjects,
    getProjectStats,
    getProjectById,
    createProject,
    updateProjectStatus,
    uploadProjectFile,
    addProjectActivity,
};
