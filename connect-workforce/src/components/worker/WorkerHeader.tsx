import React, { useEffect, useState } from 'react';
import { Bell, Briefcase, CheckCheck, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../api/workforce';

export const WorkerHeader: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.allSettled([
        notificationAPI.getNotifications(),
        notificationAPI.getUnreadCount(),
      ]);

      if (listRes.status === 'fulfilled' && listRes.value?.data) {
        setNotifications(listRes.value.data);
      }
      if (countRes.status === 'fulfilled' && countRes.value?.unreadCount !== undefined) {
        setUnreadCount(countRes.value.unreadCount);
      } else if (listRes.status === 'fulfilled' && listRes.value?.data) {
        const unread = listRes.value.data.filter((n: any) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f3f4f8]/90 backdrop-blur-md border-b border-gray-200/50 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/connecta_logo.png"
            alt="Connecta Logo"
            className="h-8 md:h-9 w-auto object-contain cursor-pointer"
            onClick={() => navigate('/workforce/me')}
          />
        </div>

        <div className="flex items-center gap-3 text-gray-500 relative">
          <button
            onClick={() => navigate('/workforce/me/jobs')}
            className="p-2.5 rounded-full hover:bg-white transition-colors relative"
            title="Browse Available Jobs"
          >
            <Briefcase className="w-5 h-5 text-gray-600" />
          </button>

          {/* NOTIFICATION BELL BUTTON */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-full hover:bg-white transition-colors relative focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center absolute top-1.5 right-1.5 shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN MODAL */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-3 z-50 text-left">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4.5 h-4.5 text-primary" />
                    <h3 className="font-extrabold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-primary font-extrabold text-[10px]">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        disabled={loading}
                        className="text-[11px] font-extrabold text-primary hover:underline flex items-center gap-1"
                      >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 space-y-1">
                      <Bell className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                      <p className="text-xs font-bold">No Notifications Yet</p>
                    </div>
                  ) : (
                    notifications.map((n: any) => {
                      const isUnread = !n.isRead && !n.read;
                      return (
                        <div
                          key={n._id}
                          onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                          className={`p-3 rounded-2xl border text-xs space-y-1 transition-all cursor-pointer ${
                            isUnread
                              ? 'bg-orange-50/50 border-orange-200/80'
                              : 'bg-gray-50/50 border-gray-100 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-gray-900 leading-tight">
                              {n.title || n.type || 'Notification'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium shrink-0">
                              {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{n.message || n.description}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
