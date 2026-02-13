import { Platform } from 'react-native';

// Only require native analytics if NOT on web
const analytics = Platform.OS !== 'web'
    ? require('@react-native-firebase/analytics').default
    : () => ({
        logEvent: async () => { },
        setUserId: async () => { },
        logAppOpen: async () => { },
        setUserProperties: async () => { },
    });

/**
 * Log a custom event to Firebase Analytics (Native)
 * @param eventName Name of the event (e.g., 'login', 'signup_complete')
 * @param params Optional parameters to include with the event
 */
export const logEvent = async (eventName: string, params?: object) => {
    try {
        if (Platform.OS !== 'web') {
            await analytics().logEvent(eventName, params || {});
            console.log(`[Analytics-Native] Event logged: ${eventName}`, params || '');
        }
    } catch (error) {
        console.error('[Analytics-Native] Error logging event:', error);
    }
};

/**
 * Set the user ID for the current session
 * @param userId The unique ID of the user
 */
export const setUserId = async (userId: string | null) => {
    try {
        if (Platform.OS !== 'web') {
            await analytics().setUserId(userId);
            console.log(`[Analytics-Native] User ID set: ${userId}`);
        }
    } catch (error) {
        console.error('[Analytics-Native] Error setting user ID:', error);
    }
};

/**
 * Log when the app is opened
 */
export const logAppOpen = async () => {
    try {
        if (Platform.OS !== 'web') {
            await analytics().logAppOpen();
            console.log('[Analytics-Native] App open logged');
        }
    } catch (error) {
        console.error('[Analytics-Native] Error logging app open:', error);
    }
};

/**
 * Set user properties
 * @param properties Object containing user properties
 */
export const setUserProperties = async (properties: { [key: string]: string | null }) => {
    try {
        if (Platform.OS !== 'web') {
            await analytics().setUserProperties(properties);
            console.log('[Analytics-Native] User properties set:', properties);
        }
    } catch (error) {
        console.error('[Analytics-Native] Error setting user properties:', error);
    }
};
