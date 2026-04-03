'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/use-permissions';
import { useLocale } from '@/lib/locale-context';
import type { PermissionKey } from '@/lib/permissions';

interface PermissionGuardProps {
  permission: PermissionKey | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function AccessDenied() {
  const { locale } = useLocale();
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <Shield className="h-10 w-10 text-destructive" />
      <p className="font-medium">{locale === 'vi' ? 'Không có quyền truy cập' : 'Access Denied'}</p>
      <p className="text-sm text-muted-foreground">
        {locale === 'vi' ? 'Bạn không có quyền truy cập chức năng này.' : 'You do not have permission.'}
      </p>
      <Link href="/" className="text-sm text-primary hover:underline">{locale === 'vi' ? 'Về trang chủ' : 'Go home'}</Link>
    </div>
  );
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions();
  if (loading) return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!hasPermission(permission)) return <>{fallback || <AccessDenied />}</>;
  return <>{children}</>;
}
