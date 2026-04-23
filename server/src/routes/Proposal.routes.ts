import { Router } from 'express';
import {
  getMyProposals,
  getAllProposals,
  getProposalById,
  createProposal,
  updateProposalStatus,
  deleteProposal,
  getProposalsByJobId,
  approveProposal,
  rejectProposal,
} from '../controllers/Proposal.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';

const router = Router();

// Get all proposals (Client received / Freelancer sent)
router.get('/', authenticate, getAllProposals);

// Get proposals for a specific job (Client)
router.get('/job/:jobId', authenticate, getProposalsByJobId);

// Get my proposals (Freelancer)
router.get('/my-proposals', authenticate, getMyProposals);

// Get single proposal by ID
router.get('/:id', authenticate, getProposalById);

// Create a new proposal (Freelancer)
router.post('/', authenticate, createProposal);

// Update proposal status (Reject only)
router.patch('/:id/status', authenticate, updateProposalStatus);

// Approve / Reject specialized routes (Mobile support)
router.put('/:id/approve', authenticate, approveProposal);
router.put('/:id/reject', authenticate, rejectProposal);

// Delete proposal
router.delete('/:id', authenticate, deleteProposal);

export default router;

