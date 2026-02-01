import { Platform } from 'react-native';

let analytics: any;
if (Platform.OS !== 'web') {
    analytics = require('@react-native-firebase/analytics').default;
}

/**
 * Log a custom event to Firebase Analytics / Google Analytics
 * @param eventName Name of the event (e.g., 'login', 'signup_complete')
 * @param params Optional parameters to include with the event
 */
export const logEvent = async (eventName: string, params?: object) => {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', eventName, params || {});
                console.log(`[Analytics-Web] Event logged: ${eventName}`, params || '');
            } else {
                console.warn('[Analytics-Web] gtag not found');
            }
        } else {
            await analytics().logEvent(eventName, params || {});
            console.log(`[Analytics-Native] Event logged: ${eventName}`, params || '');
        }
    } catch (error) {
        console.error('[Analytics] Error logging event:', error);
    }
};

/**
 * Set the user ID for the current session
 * @param userId The unique ID of the user
 */
export const setUserId = async (userId: string | null) => {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('config', 'G-93286SQF3N', {
                    'user_id': userId
                });
                console.log(`[Analytics-Web] User ID set: ${userId}`);
            }
        } else {
            await analytics().setUserId(userId);
            console.log(`[Analytics-Native] User ID set: ${userId}`);
        }
    } catch (error) {
        console.error('[Analytics] Error setting user ID:', error);
    }
};

/**
 * Log when the app is opened
 */
export const logAppOpen = async () => {
    try {
        if (Platform.OS === 'web') {
            logEvent('page_view', { page_title: 'App Open' });
        } else {
            await analytics().logAppOpen();
            console.log('[Analytics-Native] App open logged');
        }
    } catch (error) {
        console.error('[Analytics] Error logging app open:', error);
    }
};

/**
 * Set user properties
 * @param properties Object containing user properties
 */
export const setUserProperties = async (properties: { [key: string]: string | null }) => {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('set', 'user_properties', properties);
                console.log('[Analytics-Web] User properties set:', properties);
            }
        } else {
            await analytics().setUserProperties(properties);
            console.log('[Analytics-Native] User properties set:', properties);
        }
    } catch (error) {
        console.error('[Analytics] Error setting user properties:', error);
    }
};
