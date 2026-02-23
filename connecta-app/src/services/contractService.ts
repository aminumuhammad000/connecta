import { get, post, put } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export interface Contract {
    _id: string;
    title: string;
    client: any;
    freelancer: any;
    project?: any;
    status: 'active' | 'pending' | 'completed' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
    sentDate?: Date;
    expiresDate?: Date;
    terms?: string;
    amount?: number;
    clientSigned?: boolean;
    freelancerSigned?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const contractService = {
    getContracts: async (): Promise<Contract[]> => {
        const response = await get<Contract[]>(API_ENDPOINTS.MY_CONTRACTS);
        return Array.isArray(response) ? response : (response as any)?.data || [];
    },

    getContractById: async (id: string): Promise<Contract> => {
        const response = await get<Contract>(API_ENDPOINTS.CONTRACT_BY_ID(id));
        return (response as any)?.data || response;
    },

    signContract: async (id: string): Promise<Contract> => {
        const response = await post<Contract>(API_ENDPOINTS.SIGN_CONTRACT(id), {});
        return (response as any)?.data || response;
    },

    createContract: async (contractData: Partial<Contract>): Promise<Contract> => {
        const response = await post<Contract>(API_ENDPOINTS.CONTRACTS, contractData);
        return (response as any)?.data || response;
    },

    updateContract: async (id: string, contractData: Partial<Contract>): Promise<Contract> => {
        const response = await put<Contract>(API_ENDPOINTS.CONTRACT_BY_ID(id), contractData);
        return (response as any)?.data || response;
    }
};

export default contractService;
