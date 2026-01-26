import axios from 'axios';
import User from '../models/user.model.js';

class NotificationService {
    /**
     * Send Push Notification to a User
     */
    async sendPushNotification(userId: string, title: string, body: string, data?: any) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.pushToken) {
                console.log(`No push token for user ${userId}`);
                return;
            }

            if (!user.pushToken.startsWith('ExponentPushToken[')) {
                console.log(`Invalid Expo push token for user ${userId}: ${user.pushToken}`);
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

            console.log('Push notification sent:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error sending push notification:', error);
        }
    }
}

export default new NotificationService();
