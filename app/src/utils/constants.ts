/**
 * Central configuration for API and Socket URLs.
 * Switching isModeOnline to false will point the app to the local server.
 */

const isModeOnline = true; // Set to false to use Local Server

export const API_BASE_URL = isModeOnline
    ? 'https://api.myconnecta.ng/api'
    : 'http://localhost:5000/api';

export const SOCKET_URL = isModeOnline
    ? 'https://api.myconnecta.ng'
    : 'http://localhost:5000';

export const APP_DOMAIN = 'https://app.myconnecta.ng';
