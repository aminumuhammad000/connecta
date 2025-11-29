import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type PushRegistrationReason = 'expo-go' | 'denied' | 'error';

export type PushRegistrationResult = {
  token: string | null;
  reason?: PushRegistrationReason;
};

let hasLoggedExpoGoWarning = false;

export async function configureNotifications() {
  // Foreground presentation options
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: undefined,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
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
      console.warn('Remote push notifications are not available in Expo Go. Use a development build to test push delivery.');
      hasLoggedExpoGoWarning = true;
    }
    return { token: null, reason: 'expo-go' };
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return { token: token.data };
  } catch (error) {
    console.warn('Failed to fetch Expo push token', error);
    return { token: null, reason: 'error' };
  }
}

export async function scheduleLocalNotification(title: string, body: string) {
  // Ensure permissions are granted (Android 13+ and iOS require this)
  await registerForPushNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      // On Android, ensure we post to the HIGH-importance default channel
    },
    trigger: null, // immediate
  });
}
