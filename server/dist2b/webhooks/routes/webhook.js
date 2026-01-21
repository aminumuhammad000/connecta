"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const webhookController_1 = require("../controllers/webhookController");
const twilioWebhook_1 = require("../controllers/twilioWebhook");
const router = express_1.default.Router();
router.post('/flutterwave', webhookController_1.handleWebhook);
router.post('/twilio', twilioWebhook_1.handleTwilioWebhook);
exports.default = router;
