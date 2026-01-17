import { get, post, put, patch } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Proposal, ProposalStats } from '../types';

/**
 * Proposal Service
 * Handles proposal-related API calls
 */

/**
 * Get all proposals
 */
export const getAllProposals = async (): Promise<Proposal[]> => {
    const response = await get<Proposal[]>(API_ENDPOINTS.PROPOSALS);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get accepted proposals for client
 */
export const getAcceptedProposals = async (): Promise<Proposal[]> => {
    const response = await get<Proposal[]>(API_ENDPOINTS.ACCEPTED_PROPOSALS);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get proposals for a specific freelancer
 */
export const getFreelancerProposals = async (freelancerId: string): Promise<Proposal[]> => {
    const response = await get<Proposal[]>(API_ENDPOINTS.FREELANCER_PROPOSALS(freelancerId));
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get proposals for a specific job
 */
export const getProposalsByJobId = async (jobId: string): Promise<Proposal[]> => {
    const response = await get<Proposal[]>(API_ENDPOINTS.JOB_PROPOSALS(jobId));
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get proposal statistics for freelancer
 */
export const getProposalStats = async (freelancerId: string): Promise<ProposalStats> => {
    const response = await get<ProposalStats>(API_ENDPOINTS.PROPOSAL_STATS(freelancerId));
    return (response as any)?.data || response;
};

/**
 * Get proposal by ID
 */
export const getProposalById = async (id: string): Promise<Proposal> => {
    const response = await get<Proposal>(API_ENDPOINTS.PROPOSAL_BY_ID(id));
    return (response as any)?.data || response;
};

/**
 * Create new proposal
 */
export const createProposal = async (proposalData: Partial<Proposal>): Promise<Proposal> => {
    const response = await post<Proposal>(API_ENDPOINTS.PROPOSALS, proposalData);
    return (response as any)?.data || response;
};

/**
 * Approve a proposal
 */
export const approveProposal = async (id: string): Promise<Proposal> => {
    const response = await put<Proposal>(API_ENDPOINTS.APPROVE_PROPOSAL(id), {});
    return (response as any)?.data || response;
};

/**
 * Reject a proposal
 */
export const rejectProposal = async (id: string): Promise<Proposal> => {
    const response = await put<Proposal>(API_ENDPOINTS.REJECT_PROPOSAL(id), {});
    return (response as any)?.data || response;
};

/**
 * Update proposal status
 */
export const updateProposalStatus = async (id: string, status: string): Promise<Proposal> => {
    const response = await patch<Proposal>(API_ENDPOINTS.PROPOSAL_BY_ID(id) + '/status', { status });
    return (response as any)?.data || response;
};

/**
 * Generate AI Cover Letter
 */
export const generateCoverLetter = async (jobId: string): Promise<{ coverLetter: string }> => {
    const response = await post<{ coverLetter: string }>(API_ENDPOINTS.PROPOSALS + '/cover-letter', { jobId });
    return (response as any)?.data || response;
};

export default {
    getAllProposals,
    getAcceptedProposals,
    getFreelancerProposals,
    getProposalsByJobId,
    getProposalStats,
    getProposalById,
    createProposal,
    approveProposal,
    rejectProposal,
    updateProposalStatus,
    generateCoverLetter,
};
