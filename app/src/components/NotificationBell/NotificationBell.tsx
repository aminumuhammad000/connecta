import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { io, Socket } from 'socket.io-client';
import styles from './NotificationBell.module.css';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  icon?: string;
  priority?: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    setupSocketListener();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const setupSocketListener = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) return;

    const socket = io('http://localhost:5000', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('🔔 Notification socket connected');
      socket.emit('register', userId);
    });

    socket.on('notification', (notification: any) => {
      console.log('🔔 New notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
        });
      }
    });

    socketRef.current = socket;
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setShowDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      proposal_received: 'mdi:file-document',
      proposal_accepted: 'mdi:check-circle',
      proposal_rejected: 'mdi:close-circle',
      project_started: 'mdi:rocket-launch',
      project_completed: 'mdi:flag-checkered',
      milestone_completed: 'mdi:trophy',
      payment_received: 'mdi:cash',
      payment_released: 'mdi:bank-transfer',
      message_received: 'mdi:message',
      review_received: 'mdi:star',
      deadline_approaching: 'mdi:clock-alert',
      system: 'mdi:information',
    };
    return icons[type] || 'mdi:bell';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.bellButton}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Icon icon="mdi:bell" width="24" />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className={styles.markAllBtn}>
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className={styles.notificationsList}>
            {loading ? (
              <div className={styles.loading}>
                <Icon icon="eos-icons:loading" width="32" />
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <Icon icon="mdi:bell-off" width="48" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`${styles.notificationItem} ${
                    !notification.isRead ? styles.unread : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={styles.notificationIcon}>
                    <Icon
                      icon={notification.icon || getNotificationIcon(notification.type)}
                      width="24"
                    />
                  </div>
                  <div className={styles.notificationContent}>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className={styles.time}>{formatTime(notification.createdAt)}</span>
                  </div>
                  {!notification.isRead && <div className={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={styles.dropdownFooter}>
              <button onClick={() => window.location.href = '/notifications'}>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
