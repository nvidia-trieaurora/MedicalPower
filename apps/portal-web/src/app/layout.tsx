import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LocaleProvider } from '@/lib/locale-context';
import { ToastProvider } from '@/components/ui/toast';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import { NotificationProvider } from '@/lib/notification-context';
import { AppShell } from '@/components/layout/app-shell';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MedicalPower — AI-Powered Medical Imaging Platform',
  description: 'Production-grade medical imaging annotation and case management platform',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        <LocaleProvider>
          <AuthProvider>
            <ToastProvider>
              <ConfirmProvider>
                <NotificationProvider>
                  <AppShell>{children}</AppShell>
                </NotificationProvider>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
