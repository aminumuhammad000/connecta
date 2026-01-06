"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_service_1 = require("../services/email.service");
const user_model_1 = __importDefault(require("../models/user.model"));
const router = express_1.default.Router();
/**
 * POST /api/broadcast/email
 * Send broadcast email to users
 * Body: {
 *   recipientType: 'all' | 'selected' | 'individual',
 *   subject: string,
 *   body: string,
 *   selectedUserIds?: string[],
 *   individualEmail?: string
 * }
 */
router.post('/email', async (req, res) => {
    try {
        const { recipientType, subject, body, selectedUserIds, individualEmail } = req.body;
        // Validate required fields
        if (!subject || !body) {
            return res.status(400).json({
                success: false,
                message: 'Subject and body are required',
            });
        }
        let recipients = [];
        // Determine recipients based on type
        if (recipientType === 'all') {
            // Get all user emails
            const users = await user_model_1.default.find({ isBanned: false }, 'email');
            recipients = users.map(u => u.email).filter(Boolean);
        }
        else if (recipientType === 'selected') {
            // Get selected user emails
            if (!selectedUserIds || selectedUserIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No users selected',
                });
            }
            const users = await user_model_1.default.find({ _id: { $in: selectedUserIds }, isBanned: false }, 'email');
            recipients = users.map(u => u.email).filter(Boolean);
        }
        else if (recipientType === 'individual') {
            // Use individual email
            if (!individualEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Individual email is required',
                });
            }
            recipients = [individualEmail];
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipient type',
            });
        }
        if (recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No recipients found',
            });
        }
        // Send broadcast email
        const result = await (0, email_service_1.sendBroadcastEmail)(recipients, subject, body);
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: `Broadcast email sent successfully to ${result.sent} recipient(s)`,
                data: {
                    sent: result.sent,
                    failed: result.failed,
                    total: recipients.length,
                },
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send broadcast email',
                data: {
                    sent: result.sent,
                    failed: result.failed,
                    errors: result.errors,
                },
            });
        }
    }
    catch (error) {
        console.error('Broadcast email error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});
exports.default = router;
