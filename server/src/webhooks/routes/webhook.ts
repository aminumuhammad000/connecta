import express from 'express';
import { handleWebhook } from '../controllers/webhookController';
import { handleTwilioWebhook } from '../controllers/twilioWebhook';

const router = express.Router();

router.post('/flutterwave', handleWebhook);
router.post('/twilio', handleTwilioWebhook);

export default router;