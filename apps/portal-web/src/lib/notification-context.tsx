'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { notificationApi, type Notification } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [], unreadCount: 0, loading: false,
  refresh: async () => {}, markAsRead: async () => {}, markAllRead: async () => {},
});

export function useNotifications() { return useContext(NotificationContext); }

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.list({ userId: user.id, limit: 20 }),
        notificationApi.unreadCount(user.id),
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.unreadCount);
      if (countRes.unreadCount > lastCount && lastCount > 0) {
        const newest = listRes.data.find((n) => !n.readAt);
        if (newest) showToast({ type: 'info', title: newest.title, message: newest.body });
      }
      setLastCount(countRes.unreadCount);
    } catch {}
  }, [user, lastCount, showToast]);

  useEffect(() => { fetchNotifications(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    try {
      await notificationApi.markAllRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {}
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refresh: fetchNotifications, markAsRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
