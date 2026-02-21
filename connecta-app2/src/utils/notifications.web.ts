// Web-specific stub implementation for notifications
// This file is used instead of notifications.native.ts on web platform

export type PushRegistrationReason = 'expo-go' | 'denied' | 'error';

export type PushRegistrationResult = {
    token: string | null;
    reason?: PushRegistrationReason;
};

export async function configureNotifications() {
    console.log('[Notifications] Web platform - notifications not supported');
}

export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
    console.log('[Notifications] Web platform - push notifications not available');
    return { token: null, reason: 'error' };
}

export async function scheduleLocalNotification(title: string, body: string) {
    console.log('[Notifications] Web platform - local notifications not supported', { title, body });
}

export function areNotificationsAvailable(): boolean {
    return false;
}
