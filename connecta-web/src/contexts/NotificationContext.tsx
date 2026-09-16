import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { storage } from '../utils/storage';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

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
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const addNotification = useCallback((notif: AppNotification) => {
    setNotifications(prev => {
      if (prev.find(n => n._id === notif._id)) return prev;
      return [notif, ...prev];
    });
    if (!notif.isRead) {
      setUnreadCount(prev => prev + 1);
    }
    // Show native browser notification
    showBrowserNotification(notif.title, notif.message, notif.link);
  }, []);

  const fetchNotifications = useCallback(async (page = 1, _refresh = false) => {
    try {
      if (page === 1) setLoading(true);
      const res = await notificationAPI.getNotifications(page, 30);
      if (res.success && Array.isArray(res.data)) {
        if (page === 1) setNotifications(res.data as AppNotification[]);
        else setNotifications(prev => [...prev, ...(res.data as AppNotification[])]);

        const count = typeof (res as any).unreadCount === 'number'
          ? (res as any).unreadCount
          : (res.data as any[]).filter((n: any) => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.debug('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const notif = notifications.find(n => n._id === id);
    if (notif?.isRead) return;
    try {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      const res = await notificationAPI.markAsRead(id);
      if (res?.success && typeof (res as any)?.unreadCount === 'number') {
        setUnreadCount((res as any).unreadCount);
      }
    } catch {}
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await notificationAPI.markAllAsRead();
    } catch {}
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const wasUnread = notifications.find(n => n._id === id && !n.isRead);
    try {
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationAPI.deleteNotification(id);
    } catch {}
  }, [notifications]);

  const clearRead = useCallback(async () => {
    try {
      setNotifications(prev => prev.filter(n => !n.isRead));
      await notificationAPI.clearRead();
    } catch {}
  }, []);

  // Fetch when user or token becomes active, or clear on logout
  useEffect(() => {
    const activeToken = token || storage.getToken();
    if (!activeToken || !user) {
      setNotifications([]);
      setUnreadCount(0);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    fetchNotifications(1);
    setupBrowserNotifications();

    // Connect socket with active auth token
    const socket = io(SOCKET_URL, {
      auth: { token: activeToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 8,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    const currentUserId = user?._id || (user as any)?.id;

    const joinUserRoom = () => {
      if (currentUserId) {
        socket.emit('user:join', currentUserId.toString());
      }
    };

    socket.on('connect', () => {
      joinUserRoom();
    });

    // In case socket is already connected
    if (socket.connected) {
      joinUserRoom();
    }

    socket.on('notification', (data: AppNotification) => {
      addNotification(data);
    });

    socket.on('unread_count', (data: { unreadCount: number }) => {
      if (typeof data?.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [user?._id, token, fetchNotifications, addNotification]);

  // Periodic polling & window focus re-fetch to keep counts accurate
  useEffect(() => {
    const activeToken = token || storage.getToken();
    if (!activeToken || !user) return;

    const syncUnreadCount = async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        if (res.success && typeof (res.data as any)?.unreadCount === 'number') {
          setUnreadCount((res.data as any).unreadCount);
        }
      } catch {}
    };

    const handleFocus = () => {
      syncUnreadCount();
      fetchNotifications(1);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    const interval = setInterval(syncUnreadCount, 20000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [token, user, fetchNotifications]);

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
