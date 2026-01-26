import express from 'express';
import { sendBroadcastEmail } from '../services/email.service.js';
import User from '../models/user.model.js';
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
        let recipients = [];
        // Determine recipients based on type
        if (recipientType === 'all') {
            // Get all active user emails
            const users = await User.find({ isActive: true }, 'email');
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
            console.log('Selected User IDs received:', selectedUserIds);
            // First check if users exist at all
            const allUsers = await User.find({ _id: { $in: selectedUserIds } }, 'email isActive');
            console.log('Total users found (including inactive):', allUsers.length);
            console.log('Users details:', allUsers.map(u => ({ id: u._id, email: u.email, isActive: u.isActive })));
            // Then filter to active users with emails
            const users = await User.find({ _id: { $in: selectedUserIds }, isActive: true }, 'email');
            console.log('Active users found:', users.length);
            console.log('User emails:', users.map(u => u.email));
            recipients = users.map(u => u.email).filter(Boolean);
            // Provide detailed error if no recipients
            if (recipients.length === 0) {
                const inactiveCount = allUsers.filter(u => !u.isActive).length;
                const noEmailCount = allUsers.filter(u => !u.email).length;
                let detailedMessage = 'No valid recipients found. ';
                if (allUsers.length === 0) {
                    detailedMessage += `None of the selected user IDs exist in the database.`;
                }
                else if (inactiveCount > 0) {
                    detailedMessage += `${inactiveCount} user(s) are inactive. `;
                }
                if (noEmailCount > 0) {
                    detailedMessage += `${noEmailCount} user(s) have no email address.`;
                }
                return res.status(400).json({
                    success: false,
                    message: detailedMessage,
                });
            }
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
export default router;
