import express from 'express';
import { handleTwilioWebhook } from '../controllers/twilioWebhook.js';

const router = express.Router();

router.post('/twilio', handleTwilioWebhook);

export default router;