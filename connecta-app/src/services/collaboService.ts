import { post, get, patch, del, uploadFile as uploadFileApi } from './api';

export const createCollaboProject = async (data: any) => {
    const response = await post('/api/collabo/create', data);
    return (response as any)?.data || response;
};

export const getCollaboProject = async (id: string) => {
    const response = await get(`/api/collabo/${id}`);
    return (response as any)?.data || response;
};

export const activateCollaboProject = async (id: string) => {
    const response = await post(`/api/collabo/${id}/activate`, {});
    return (response as any)?.data || response;
};

export const fundCollaboProject = async (id: string) => {
    const response = await post(`/api/collabo/${id}/fund`, {});
    return (response as any)?.data || response;
};

export const startWork = async (id: string) => {
    const response = await post(`/api/collabo/${id}/start`, {});
    return (response as any)?.data || response;
};

export const removeFromRole = async (roleId: string) => {
    const response = await post(`/api/collabo/role/${roleId}/remove`, {});
    return (response as any)?.data || response;
};

export const inviteToRole = async (roleId: string, freelancerId: string) => {
    const response = await post(`/api/collabo/role/${roleId}/invite`, { freelancerId });
    return (response as any)?.data || response;
};

export const addRole = async (projectId: string, roleData: { title: string; description: string; budget: number; skills: string[] }) => {
    const response = await post(`/api/collabo/${projectId}/role`, roleData);
    return (response as any)?.data || response;
};

export const getMyCollaboProjects = async () => {
    const response = await get('/api/collabo/my-projects');
    return (response as any)?.data || response;
};

export const getFreelancerCollaboProjects = async () => {
    const response = await get('/api/collabo/freelancer-projects');
    return (response as any)?.data || response;
};

export const acceptCollaboRole = async (roleId: string) => {
    const response = await post('/api/collabo/accept-role', { roleId });
    return (response as any)?.data || response;
};

export const getRole = async (roleId: string) => {
    const response = await get(`/api/collabo/role/${roleId}`);
    return (response as any)?.data || response;
};

export const sendMessage = async (data: any) => {
    const response = await post('/api/collabo/message', data);
    return (response as any)?.data || response;
};

export const getMessages = async (workspaceId: string, channelName: string) => {
    const response = await get(`/api/collabo/messages?workspaceId=${workspaceId}&channelName=${channelName}`);
    return (response as any)?.data || response;
};

export const markWorkspaceRead = async (workspaceId: string) => {
    const response = await post('/api/collabo/mark-read', { workspaceId });
    return (response as any)?.data || response;
};

export const createTask = async (data: any) => {
    const response = await post('/api/collabo/task', data);
    return (response as any)?.data || response;
};

export const getTasks = async (workspaceId: string) => {
    const response = await get(`/api/collabo/tasks?workspaceId=${workspaceId}`);
    return (response as any)?.data || response;
};

export const updateTask = async (taskId: string, updates: any) => {
    const response = await patch(`/api/collabo/task/${taskId}`, updates);
    return (response as any)?.data || response;
};

export const uploadFile = async (data: FormData) => {
    const response = await uploadFileApi('/api/collabo/file', data);
    return (response as any)?.data || response;
};

export const getFiles = async (workspaceId: string) => {
    const response = await get(`/api/collabo/files?workspaceId=${workspaceId}`);
    return (response as any)?.data || response;
};
export const deleteTask = async (taskId: string) => {
    const response = await del(`/api/collabo/task/${taskId}`);
    return (response as any)?.data || response;
};

export const deleteFile = async (fileId: string) => {
    const response = await del(`/api/collabo/file/${fileId}`);
    return (response as any)?.data || response;
};
