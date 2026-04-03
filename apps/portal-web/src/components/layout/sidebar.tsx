'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FolderOpen, ListTodo, GitBranchPlus, Settings, Shield,
  MonitorCog, UserCog, KeyRound, Bell, CheckCheck, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/locale-context';
import { useNotifications } from '@/lib/notification-context';
import { usePermissions } from '@/hooks/use-permissions';

const mainNavItems = [
  { href: '/', icon: LayoutDashboard, labelKey: 'common.nav.dashboard', permission: null },
  { href: '/patients', icon: Users, labelKey: 'common.nav.patients', permission: null },
  { href: '/cases', icon: FolderOpen, labelKey: 'common.nav.cases', permission: null },
  { href: '/tasks', icon: ListTodo, labelKey: 'common.nav.tasks', permission: null },
  { href: '/workflows', icon: GitBranchPlus, labelKey: 'common.nav.workflows', permission: 'workflow_builder' as const },
];

const adminNavItems = [
  { href: '/admin', icon: Shield, labelKey: 'admin.nav.dashboard' },
  { href: '/admin/users', icon: UserCog, labelKey: 'admin.nav.users' },
  { href: '/admin/permissions', icon: KeyRound, labelKey: 'admin.nav.permissions' },
  { href: '/admin/system', icon: MonitorCog, labelKey: 'admin.nav.system' },
];

export function Sidebar() {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission('admin_panel');
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <aside className={cn('flex flex-col border-r bg-card transition-all duration-200', collapsed ? 'w-16' : 'w-60')}>
      <div className="flex h-14 items-center border-b px-3">
        {!collapsed ? <Link href="/" className="flex items-center"><Logo size="sm" /></Link>
          : <Link href="/" className="mx-auto"><Logo size="sm" showText={false} /></Link>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {!collapsed && <p className="mb-1 px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>}
        {mainNavItems.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={collapsed ? t(item.labelKey) : undefined}
              className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2')}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            {!collapsed && <p className="mb-1 mt-4 px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('admin.nav.section')}</p>}
            {collapsed && <div className="my-2 border-t" />}
            {adminNavItems.map((item) => {
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} title={collapsed ? t(item.labelKey) : undefined}
                  className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-orange-500/10 text-orange-600' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center px-2')}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t p-2">
        {user && !collapsed && (
          <div className="mb-2 rounded-md bg-muted/50 px-3 py-2">
            <p className="truncate text-xs font-medium">{user.fullName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
          </div>
        )}

        {user && (
          <div ref={bellRef} className="relative">
            <button onClick={() => setBellOpen(!bellOpen)} title={collapsed ? t('notification.title') : undefined}
              className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground', collapsed && 'justify-center px-2')}>
              <span className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </span>
              {!collapsed && <span>{t('notification.title')}</span>}
            </button>
            {bellOpen && !collapsed && (
              <div className="absolute bottom-full left-0 mb-2 w-80 rounded-lg border bg-card shadow-xl z-50">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-semibold">{t('notification.title')}</p>
                  {unreadCount > 0 && <button onClick={() => markAllRead()} className="flex items-center gap-1 text-[11px] text-primary hover:underline"><CheckCheck className="h-3 w-3" />{t('notification.markAllRead')}</button>}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? <p className="py-8 text-center text-xs text-muted-foreground">{t('notification.empty')}</p> : (
                    notifications.slice(0, 10).map((n) => (
                      <button key={n.id} onClick={() => { if (!n.readAt) markAsRead(n.id); }}
                        className={cn('flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50', !n.readAt && 'bg-primary/5')}>
                        {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-xs', !n.readAt && 'font-medium')}>{n.title}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground truncate">{n.body}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t px-4 py-2">
                  <Link href="/notifications" onClick={() => setBellOpen(false)} className="block text-center text-xs text-primary hover:underline">{t('notification.viewAll')}</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {user && (
          <button onClick={logout} title={collapsed ? t('common.nav.logout') : undefined}
            className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive', collapsed && 'justify-center px-2')}>
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t('common.nav.logout')}</span>}
          </button>
        )}

        {!user && (
          <Link href="/login" className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent', collapsed && 'justify-center px-2')}>
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t('auth.login.submit')}</span>}
          </Link>
        )}

        <Button variant="ghost" size="sm" className="mt-1 w-full justify-center" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
