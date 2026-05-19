import Constants from 'expo-constants';
import { Platform } from 'react-native';

type PushRegistrationReason = 'expo-go' | 'denied' | 'error' | 'unavailable';

export type PushRegistrationResult = {
  token: string | null;
  reason?: PushRegistrationReason;
};

// Try to import expo-notifications, but skip in Expo Go to avoid library errors
let Notifications: any = null;
let isNotificationsAvailable = false;

// Don't even try to load notifications in Expo Go to avoid the library's own error messages
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    // Only load in development builds, not Expo Go
    Notifications = require('expo-notifications');
    isNotificationsAvailable = true;
    console.log('[Notifications] expo-notifications loaded successfully');
  } catch (error) {
    console.warn('[Notifications] expo-notifications not available - running in limited mode');
    isNotificationsAvailable = false;
  }
} else {
  console.log('[Notifications] Running in Expo Go - notifications disabled to avoid errors');
}

let hasLoggedExpoGoWarning = false;

export async function configureNotifications() {
  // Skip if notifications are not available
  if (!isNotificationsAvailable || !Notifications) {
    console.log('[Notifications] Skipping configuration - notifications not available');
    return;
  }

  // Skip notification setup on web - not fully supported
  if (Platform.OS === 'web') {
    console.log('[Notifications] Skipping configuration on web platform');
    return;
  }

  try {
    // Foreground presentation options — show alert, play sound, set badge
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      // Default channel — HIGH importance so notifications appear as popup heads-up
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',               // system default notification sound
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  } catch (error) {
    console.warn('[Notifications] Failed to configure notifications:', error);
  }
}

export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  // Return early if notifications are not available
  if (!isNotificationsAvailable || !Notifications) {
    console.log('[Notifications] Push notifications not available in this build');
    return { token: null, reason: 'unavailable' };
  }

  // Skip on web - push notifications not fully supported
  if (Platform.OS === 'web') {
    console.log('[Notifications] Push notifications not available on web platform');
    return { token: null, reason: 'error' };
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return { token: null, reason: 'denied' };
    }

    if (Constants.appOwnership === 'expo') {
      if (!hasLoggedExpoGoWarning) {
        console.warn('[Notifications] Remote push notifications are not available in Expo Go. Use a development build to test push delivery.');
        hasLoggedExpoGoWarning = true;
      }
      return { token: null, reason: 'expo-go' };
    }

    // Get the Expo project ID from app config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });
    console.log('[Notifications] Push token obtained:', token.data);
    return { token: token.data };
  } catch (error) {
    console.warn('[Notifications] Failed to fetch Expo push token', error);
    return { token: null, reason: 'error' };
  }
}

export async function scheduleLocalNotification(title: string, body: string) {
  // Return early if notifications are not available
  if (!isNotificationsAvailable || !Notifications) {
    console.log('[Notifications] Cannot schedule notification - notifications not available');
    return;
  }

  try {
    // Ensure permissions are granted (Android 13+ and iOS require this)
    await registerForPushNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
      },
      trigger: null, // immediate
    });
  } catch (error) {
    console.warn('[Notifications] Failed to schedule local notification:', error);
  }
}

// Export a helper to check if notifications are available
export function areNotificationsAvailable(): boolean {
  return isNotificationsAvailable;
}
