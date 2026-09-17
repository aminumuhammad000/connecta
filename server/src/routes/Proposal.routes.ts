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
  getAllProposalsAdmin,
  updateProposal,
  withdrawProposal
} from '../controllers/Proposal.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';

const router = Router();

// Admin: Get all proposals
router.get('/admin/all', authenticate, isAdmin, getAllProposalsAdmin);

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

// Edit/update proposal (Freelancer)
router.put('/:id', authenticate, updateProposal);

// Withdraw proposal (Freelancer)
router.put('/:id/withdraw', authenticate, withdrawProposal);
router.post('/:id/withdraw', authenticate, withdrawProposal);

// Update proposal status (Reject only)
router.patch('/:id/status', authenticate, updateProposalStatus);

// Approve / Reject specialized routes (Mobile & Web support)
router.put('/:id/approve', authenticate, approveProposal);
router.put('/:id/accept', authenticate, approveProposal);
router.put('/:id/reject', authenticate, rejectProposal);

// Delete proposal
router.delete('/:id', authenticate, deleteProposal);

export default router;

