'use client';

import { Users, Activity, Server, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useLocale } from '@/hooks/use-locale';

const stats = [
  { labelKey: 'admin.stats.users', value: '4', icon: Users, href: '/admin/users', color: 'text-blue-500' },
  { labelKey: 'admin.stats.services', value: '6/10', icon: Server, href: '/admin/system', color: 'text-green-500' },
  { labelKey: 'admin.stats.warnings', value: '2', icon: AlertTriangle, href: '/admin/system', color: 'text-amber-500' },
  { labelKey: 'admin.stats.system', value: 'OK', icon: CheckCircle2, href: '/admin/system', color: 'text-emerald-500' },
];

export default function AdminDashboardPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
          <Shield className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.labelKey} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('admin.activity.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: 'Đăng nhập', user: 'admin@medicalpower.dev', time: 'Vừa xong' },
              { action: 'Chạy inference segmentation', user: 'Nguyễn Thị Mai', time: '5 phút trước' },
              { action: 'Tạo ca bệnh mới', user: 'Dr. Đỗ Bảo Ngọc', time: '15 phút trước' },
              { action: 'Upload DICOM', user: 'BS. Trần Văn Hùng', time: '1 giờ trước' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('admin.services.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: 'PostgreSQL', port: 5432, status: 'healthy' },
              { name: 'Redis', port: 6379, status: 'healthy' },
              { name: 'Orthanc DICOM', port: 8042, status: 'healthy' },
              { name: 'Portal Web', port: 3000, status: 'healthy' },
              { name: 'Patient API', port: 4002, status: 'healthy' },
              { name: 'MONAI Label', port: 8000, status: 'unknown' },
              { name: 'Keycloak', port: 8080, status: 'stopped' },
              { name: 'Workflow API', port: 4006, status: 'stopped' },
            ].map((svc) => (
              <div key={svc.name} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${svc.status === 'healthy' ? 'bg-green-500' : svc.status === 'stopped' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <span className="text-sm">{svc.name}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">:{svc.port}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
