import axios from 'axios';
import User from '../models/user.model.js';
import Notification from '../models/Notification.model.js';
import * as emailService from './email.service.js';
class NotificationService {
    /**
     * Create In-App Notification and Send Push/Email
     */
    async createNotification(params) {
        try {
            const { userId, type, title, message, relatedId, relatedType, actorId, actorName, link, shouldSendPush = true, shouldSendEmail = true } = params;
            // 1. Save to Database
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                relatedId,
                relatedType,
                actorId,
                actorName,
                link,
                isRead: false
            });
            // 2. Clear unread count cache if necessary (or emit socket event)
            // (Handled by controllers usually)
            // 3. Send Push Notification
            if (shouldSendPush) {
                await this.sendPushNotification(userId, title, message, { relatedId, relatedType, type });
            }
            // 4. Send Email Notification
            if (shouldSendEmail) {
                const user = await User.findById(userId);
                if (user && user.email) {
                    const userName = user.firstName || 'User';
                    switch (type) {
                        case 'proposal_accepted':
                            await emailService.sendProposalAcceptedEmail(user.email, userName, title, actorName || 'Client', '');
                            break;
                        case 'payment_released':
                            // Assuming message contains amount info or similar
                            await emailService.sendJobApprovedEmail(user.email, userName, title, 0);
                            break;
                        case 'message_received':
                            await emailService.sendNewMessageEmail(user.email, userName, actorName || 'User', message, '');
                            break;
                        case 'payment_received':
                            await emailService.sendWalletCreditedEmail(user.email, userName, 0, actorName || 'System');
                            break;
                        // Add more as needed
                    }
                }
            }
            return notification;
        }
        catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }
    /**
     * Send Push Notification to a User
     */
    async sendPushNotification(userId, title, body, data) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.pushToken) {
                return;
            }
            if (!user.pushToken.startsWith('ExponentPushToken[')) {
                return;
            }
            const message = {
                to: user.pushToken,
                sound: 'default',
                title,
                body,
                data: data || {},
            };
            const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
}
export default new NotificationService();
