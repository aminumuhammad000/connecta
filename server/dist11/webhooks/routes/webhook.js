import express from 'express';
import { handleWebhook } from '../controllers/webhookController.js';
import { handleTwilioWebhook } from '../controllers/twilioWebhook.js';
const router = express.Router();
router.post('/flutterwave', handleWebhook);
router.post('/twilio', handleTwilioWebhook);
export default router;
