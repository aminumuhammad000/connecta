import express from 'express';
import { sendBroadcastEmail } from '../services/email.service';
import User from '../models/user.model';

const router = express.Router();

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

        let recipients: string[] = [];

        // Determine recipients based on type
        if (recipientType === 'all') {
            // Get all user emails
            const users = await User.find({ isBanned: false }, 'email');
            recipients = users.map(u => u.email).filter(Boolean);
        } else if (recipientType === 'selected') {
            // Get selected user emails
            if (!selectedUserIds || selectedUserIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No users selected',
                });
            }
            const users = await User.find({ _id: { $in: selectedUserIds }, isBanned: false }, 'email');
            recipients = users.map(u => u.email).filter(Boolean);
        } else if (recipientType === 'individual') {
            // Use individual email
            if (!individualEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Individual email is required',
                });
            }
            recipients = [individualEmail];
        } else {
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
        const result = await sendBroadcastEmail(recipients, subject, body);

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
        } else {
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
    } catch (error: any) {
        console.error('Broadcast email error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

export default router;
