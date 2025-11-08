import express from 'express';
import {
  editProposal,
  withdrawProposal,
  createCounterOffer,
  respondToCounterOffer,
  createProposalTemplate,
  getProposalTemplates,
  useTemplate,
  deleteProposalTemplate,
  handleExpiredProposals,
} from '../controllers/proposalImprovements.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = express.Router();

// Proposal editing
router.put('/:proposalId/edit', authenticate, editProposal);

// Proposal withdrawal
router.post('/:proposalId/withdraw', authenticate, withdrawProposal);

// Counter-offers
router.post('/:proposalId/counter-offer', authenticate, createCounterOffer);
router.post('/:proposalId/counter-offer/:offerIndex/respond', authenticate, respondToCounterOffer);

// Templates
router.post('/templates', authenticate, createProposalTemplate);
router.get('/templates', authenticate, getProposalTemplates);
router.post('/templates/:templateId/use', authenticate, useTemplate);
router.delete('/templates/:templateId', authenticate, deleteProposalTemplate);

// Expiry handling (admin or cron)
router.post('/expire-old', handleExpiredProposals);

export default router;
