import express from 'express';
import {
  createContract,
  getContractById,
  getUserContracts,
  signContract,
  terminateContract,
  getContractTemplate,
} from '../controllers/contract.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = express.Router();

// Create contract (protected - client only)
router.post('/', authenticate, createContract);

// Get user's contracts (protected)
router.get('/', authenticate, getUserContracts);

// Get contract template (public)
router.get('/templates/:type', getContractTemplate);

// Get contract by ID (protected)
router.get('/:contractId', authenticate, getContractById);

// Sign contract (protected)
router.post('/:contractId/sign', authenticate, signContract);

// Terminate contract (protected)
router.post('/:contractId/terminate', authenticate, terminateContract);

export default router;
