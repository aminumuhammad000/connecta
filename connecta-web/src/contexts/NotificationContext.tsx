import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { storage } from '../utils/storage';
import { notificationAPI } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://api.myconnecta.ng';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  actorName?: string;
  relatedId?: string;
  relatedType?: string;
  priority?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (page?: number, refresh?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearRead: () => Promise<void>;
  addNotification: (notif: AppNotification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/** Request browser Notification permission and register service worker */
async function setupBrowserNotifications() {
  try {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
  } catch (e) {
    console.warn('Browser notification setup failed:', e);
  }
}

/** Show a native browser notification */
function showBrowserNotification(title: string, body: string, link?: string) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/favicon.svg',
    });
    if (link) n.onclick = () => { window.focus(); window.location.href = link; n.close(); };
    setTimeout(() => n.close(), 8000);
  } catch {}
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const fetchedRef = useRef(false);

  const addNotification = useCallback((notif: AppNotification) => {
    setNotifications(prev => {
      if (prev.find(n => n._id === notif._id)) return prev;
      return [notif, ...prev];
    });
    if (!notif.isRead) setUnreadCount(prev => prev + 1);
    // Show browser notification
    showBrowserNotification(notif.title, notif.message, notif.link);
  }, []);

  const fetchNotifications = useCallback(async (page = 1, refresh = false) => {
    try {
      if (page === 1) setLoading(true);
      const res = await notificationAPI.getNotifications(page, 30);
      if (res.success && Array.isArray(res.data)) {
        if (page === 1) setNotifications(res.data as AppNotification[]);
        else setNotifications(prev => [...prev, ...(res.data as AppNotification[])]);
        setUnreadCount((res as any).unreadCount ?? (res.data as any[]).filter((n: any) => !n.isRead).length);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const notif = notifications.find(n => n._id === id);
    if (notif?.isRead) return;
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const wasUnread = notifications.find(n => n._id === id && !n.isRead);
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, [notifications]);

  const clearRead = useCallback(async () => {
    try {
      await notificationAPI.clearRead();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch {}
  }, []);

  // Initial fetch + browser permission
  useEffect(() => {
    const token = storage.getToken();
    if (!token || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchNotifications(1);
    setupBrowserNotifications();
  }, [fetchNotifications]);

  // Poll unread count every 60s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        if (res.success) setUnreadCount((res.data as any)?.unreadCount ?? 0);
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Socket.IO real-time notifications
  useEffect(() => {
    const token = storage.getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('notification', (data: AppNotification) => {
      addNotification(data);
    });

    socket.on('connect_error', () => {
      // silent fail - polling handles the gap
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearRead,
      addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
