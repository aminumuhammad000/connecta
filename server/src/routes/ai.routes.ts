import { Router } from 'express';
import { chatWithAI, summarizeProposal, matchTalentForJob, recommendJobsForUser, aiQuickApply } from '../controllers/ai.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';

const router = Router();

router.post('/chat', authenticate, chatWithAI);
router.post('/summarize-proposal', authenticate, summarizeProposal);
router.post('/match-talent', authenticate, matchTalentForJob);
router.get('/recommended-jobs', authenticate, recommendJobsForUser);
router.post('/quick-apply', authenticate, aiQuickApply);

export default router;
