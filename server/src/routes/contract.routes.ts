import express from 'express';
import {
  createOffer,
  acceptOffer,
  submitWork,
  approveWork,
  getUserContracts,
  getContractById,
  getAllContractsAdmin,
  terminateContract,
  getContractTemplate
} from '../controllers/contract.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';

const router = express.Router();

// Admin: Get all contracts (must be BEFORE /:id)
router.get('/admin/all', authenticate, isAdmin, getAllContractsAdmin);

// Create offer (Client only) / Also used by Admin Panel
router.post('/offer', authenticate, createOffer);
router.post('/', authenticate, createOffer);

// Accept offer (Freelancer only) / Also used by Admin Panel as /sign
router.post('/accept/:id', authenticate, acceptOffer);
router.post('/:id/sign', authenticate, acceptOffer);

// Terminate contract
router.post('/:id/terminate', authenticate, isAdmin, terminateContract);

// Get template
router.get('/templates/:type', authenticate, getContractTemplate);

// Submit work (Freelancer only)
router.post('/submit/:id', authenticate, submitWork);

// Approve work (Client only)
router.post('/approve/:id', authenticate, approveWork);

// Get user's contracts
router.get('/', authenticate, getUserContracts);

// Get contract by ID
router.get('/:id', authenticate, getContractById);

export default router;

