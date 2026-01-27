import analytics from '@react-native-firebase/analytics';

/**
 * Log a custom event to Firebase Analytics
 * @param eventName Name of the event (e.g., 'login', 'signup_complete')
 * @param params Optional parameters to include with the event
 */
export const logEvent = async (eventName: string, params?: object) => {
    try {
        await analytics().logEvent(eventName, params);
        console.log(`[Analytics] Event logged: ${eventName}`, params || '');
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
        await analytics().setUserId(userId);
        console.log(`[Analytics] User ID set: ${userId}`);
    } catch (error) {
        console.error('[Analytics] Error setting user ID:', error);
    }
};

/**
 * Log when the app is opened
 */
export const logAppOpen = async () => {
    try {
        await analytics().logAppOpen();
        console.log('[Analytics] App open logged');
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
        await analytics().setUserProperties(properties);
        console.log('[Analytics] User properties set:', properties);
    } catch (error) {
        console.error('[Analytics] Error setting user properties:', error);
    }
};
