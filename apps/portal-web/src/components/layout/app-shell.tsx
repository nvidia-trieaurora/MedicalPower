'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useLocale } from '@/hooks/use-locale';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar t={t} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header locale={locale} onToggleLocale={toggleLocale} t={t} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
