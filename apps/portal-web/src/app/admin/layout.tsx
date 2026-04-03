'use client';

import { useAuth } from '@/lib/auth-context';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Shield className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">Vui lòng đăng nhập</p>
        <Link href="/login" className="text-sm text-primary hover:underline">Đăng nhập</Link>
      </div>
    );
  }

  if (user.role !== 'system_admin' && user.role !== 'org_admin') {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Shield className="h-10 w-10 text-destructive" />
        <p className="font-medium">Không có quyền truy cập</p>
        <p className="text-sm text-muted-foreground">Chỉ Admin mới có thể truy cập trang này</p>
        <Link href="/" className="text-sm text-primary hover:underline">Về trang chủ</Link>
      </div>
    );
  }

  return <>{children}</>;
}
