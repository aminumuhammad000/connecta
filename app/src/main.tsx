import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import './index.css'
import './styles/notification.css'
import App from './App.tsx'
import { NotificationProvider } from './contexts/NotificationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)

// Register Service Worker for "Save in Catch" (Caching)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
