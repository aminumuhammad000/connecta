import { Router } from 'express';
import { authenticate } from '../core/middleware/auth.middleware.js';
import {
  startAiInterview,
  submitAnswer,
  completeAiInterview,
  getInterviewByProposalId,
  streamElevenLabsSpeech
} from '../controllers/aiInterview.controller.js';

const router = Router();

router.post('/start', authenticate, startAiInterview);
router.post('/tts', streamElevenLabsSpeech);
router.post('/:id/answer', authenticate, submitAnswer);
router.post('/:id/complete', authenticate, completeAiInterview);
router.get('/proposal/:proposalId', authenticate, getInterviewByProposalId);

export default router;
