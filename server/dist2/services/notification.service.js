"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const user_model_1 = __importDefault(require("../models/user.model"));
class NotificationService {
    /**
     * Send Push Notification to a User
     */
    async sendPushNotification(userId, title, body, data) {
        try {
            const user = await user_model_1.default.findById(userId);
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
            const response = await axios_1.default.post('https://exp.host/--/api/v2/push/send', message, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            });
            console.log('Push notification sent:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
}
exports.default = new NotificationService();
