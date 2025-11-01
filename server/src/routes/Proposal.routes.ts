import { Router } from 'express';
import {
  getAllProposals,
  getFreelancerProposals,
  getProposalById,
  createProposal,
  updateProposalStatus,
  updateProposal,
  deleteProposal,
  getProposalStats,
  getClientAcceptedProposals,
  approveProposal,
  rejectProposal,
} from '../controllers/Proposal.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = Router();

// Get all proposals (admin/general)
router.get('/', getAllProposals);

// Get accepted proposals for client (protected)
router.get('/client/accepted', authenticate, getClientAcceptedProposals);

// Get proposals for a specific freelancer
router.get('/freelancer/:freelancerId', getFreelancerProposals);

// Get proposal statistics for a freelancer
router.get('/stats/:freelancerId', getProposalStats);

// Approve a proposal (protected)
router.put('/:id/approve', authenticate, approveProposal);

// Reject a proposal (protected)
router.put('/:id/reject', authenticate, rejectProposal);

// Get single proposal by ID
router.get('/:id', getProposalById);

// Create a new proposal (protected)
router.post('/', authenticate, createProposal);

// Update proposal status (accept/decline)
router.patch('/:id/status', updateProposalStatus);

// Update proposal
router.put('/:id', updateProposal);

// Delete proposal
router.delete('/:id', deleteProposal);

export default router;
