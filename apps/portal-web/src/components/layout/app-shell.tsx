'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useLocale } from '@/lib/locale-context';
import { useAuth } from '@/lib/auth-context';
import { LandingRedirect } from './landing-redirect';

interface AppShellProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login'];

export function AppShell({ children }: AppShellProps) {
  const { locale, toggleLocale, t } = useLocale();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('common.table.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingRedirect />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
