// TypeScript declarations for platform-specific notification implementations

export type PushRegistrationReason = 'expo-go' | 'denied' | 'error';

export type PushRegistrationResult = {
    token: string | null;
    reason?: PushRegistrationReason;
};

export function configureNotifications(): Promise<void>;

export function registerForPushNotificationsAsync(): Promise<PushRegistrationResult>;

export function scheduleLocalNotification(title: string, body: string): Promise<void>;
