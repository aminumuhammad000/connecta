/**
 * Log a custom event to Google Analytics (Web)
 * @param eventName Name of the event (e.g., 'login', 'signup_complete')
 * @param params Optional parameters to include with the event
 */
export const logEvent = async (eventName: string, params?: object) => {
    try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', eventName, params || {});
            console.log(`[Analytics-Web] Event logged: ${eventName}`, params || '');
        } else {
            console.warn('[Analytics-Web] gtag not found');
        }
    } catch (error) {
        console.error('[Analytics-Web] Error logging event:', error);
    }
};

/**
 * Set the user ID for the current session
 * @param userId The unique ID of the user
 */
export const setUserId = async (userId: string | null) => {
    try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('config', 'G-93286SQF3N', {
                'user_id': userId
            });
            console.log(`[Analytics-Web] User ID set: ${userId}`);
        }
    } catch (error) {
        console.error('[Analytics-Web] Error setting user ID:', error);
    }
};

/**
 * Log when the app is opened
 */
export const logAppOpen = async () => {
    try {
        logEvent('page_view', { page_title: 'App Open' });
    } catch (error) {
        console.error('[Analytics-Web] Error logging app open:', error);
    }
};

/**
 * Set user properties
 * @param properties Object containing user properties
 */
export const setUserProperties = async (properties: { [key: string]: string | null }) => {
    try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('set', 'user_properties', properties);
            console.log('[Analytics-Web] User properties set:', properties);
        }
    } catch (error) {
        console.error('[Analytics-Web] Error setting user properties:', error);
    }
};
