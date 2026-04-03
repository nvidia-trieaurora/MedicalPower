'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notificationApi, type Notification } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/notification-context';
import { useLocale } from '@/lib/locale-context';

const typeLabel: Record<string, string> = { task_assigned: 'Nhiệm vụ mới', task_status_changed: 'Cập nhật', sla_warning: 'SLA', permission_changed: 'Quyền', system: 'Hệ thống' };
const typeColor: Record<string, string> = { task_assigned: 'bg-blue-100 text-blue-700', task_status_changed: 'bg-green-100 text-green-700', sla_warning: 'bg-amber-100 text-amber-700', permission_changed: 'bg-violet-100 text-violet-700', system: 'bg-gray-100 text-gray-700' };

export default function NotificationsPage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const { markAllRead, refresh: refreshContext } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationApi.list({ userId: user.id, unreadOnly: filter === 'unread', page, limit: 20 });
      setNotifications(res.data); setTotalPages(res.meta.totalPages);
    } catch { setNotifications([]); }
    setLoading(false);
  }, [user, filter, page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try { await notificationApi.markAsRead(id); setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))); refreshContext(); } catch {}
  };

  const vi = locale === 'vi';
  const dateLocale = vi ? 'vi-VN' : 'en-US';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Bell className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-2xl font-bold">{vi ? 'Thông báo' : 'Notifications'}</h1></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { markAllRead(); fetchNotifications(); }}><CheckCheck className="mr-1 h-3 w-3" />{vi ? 'Đọc hết' : 'Mark all read'}</Button>
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}><RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => { setFilter('all'); setPage(1); }}>{vi ? 'Tất cả' : 'All'}</Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => { setFilter('unread'); setPage(1); }}><Filter className="mr-1 h-3 w-3" />{vi ? 'Chưa đọc' : 'Unread'}</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground"><RefreshCw className="mr-2 h-4 w-4 animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Bell className="mb-3 h-10 w-10 opacity-30" /><p className="text-sm">{vi ? 'Chưa có thông báo' : 'No notifications'}</p></div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-4 px-6 py-4 transition-colors ${!n.readAt ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'}`}>
                  {!n.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  {n.readAt && <span className="mt-2 h-2 w-2 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.readAt ? 'font-semibold' : ''}`}>{n.title}</p>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${typeColor[n.type] || ''}`}>{typeLabel[n.type] || n.type}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">{new Date(n.createdAt).toLocaleString(dateLocale)}</p>
                  </div>
                  {!n.readAt && <Button variant="ghost" size="sm" className="shrink-0 text-xs h-7" onClick={() => handleMarkRead(n.id)}>{vi ? 'Đã đọc' : 'Read'}</Button>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{vi ? 'Trước' : 'Prev'}</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{vi ? 'Sau' : 'Next'}</Button>
        </div>
      )}
    </div>
  );
}
