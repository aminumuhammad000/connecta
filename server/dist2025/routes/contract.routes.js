import express from 'express';
import { createOffer, acceptOffer, submitWork, approveWork, getUserContracts, getContractById, } from '../controllers/contract.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
const router = express.Router();
// Create offer (Client only)
router.post('/offer', authenticate, createOffer);
// Accept offer (Freelancer only)
router.post('/accept/:id', authenticate, acceptOffer);
// Submit work (Freelancer only)
router.post('/submit/:id', authenticate, submitWork);
// Approve work (Client only)
router.post('/approve/:id', authenticate, approveWork);
// Get user's contracts
router.get('/', authenticate, getUserContracts);
// Get contract by ID
router.get('/:id', authenticate, getContractById);
export default router;
