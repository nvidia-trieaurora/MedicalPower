'use client';

import { useState } from 'react';
import { UserCog, Plus, Search, Shield, Ban, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/lib/locale-context';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import type { UserRole } from '@/lib/auth';

interface MockUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'blocked' | 'pending';
  lastLogin: string | null;
  createdAt: string;
}

const roleLabels: Record<UserRole, string> = {
  system_admin: 'System Admin',
  org_admin: 'Org Admin',
  clinical_lead: 'Clinical Lead',
  radiologist: 'Radiologist',
  annotator: 'Annotator',
  qa_reviewer: 'QA Reviewer',
  data_scientist: 'Data Scientist',
  viewer: 'Viewer',
};

const roleColor: Record<UserRole, string> = {
  system_admin: 'bg-red-100 text-red-700',
  org_admin: 'bg-orange-100 text-orange-700',
  clinical_lead: 'bg-purple-100 text-purple-700',
  radiologist: 'bg-blue-100 text-blue-700',
  annotator: 'bg-green-100 text-green-700',
  qa_reviewer: 'bg-indigo-100 text-indigo-700',
  data_scientist: 'bg-cyan-100 text-cyan-700',
  viewer: 'bg-gray-100 text-gray-700',
};

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
};

const mockUsers: MockUser[] = [
  { id: 'user_admin', email: 'admin@medicalpower.dev', fullName: 'System Admin', role: 'system_admin', status: 'active', lastLogin: '2026-03-21T22:00:00Z', createdAt: '2026-03-19T00:00:00Z' },
  { id: 'user_lead', email: 'lead@medicalpower.dev', fullName: 'Dr. Đỗ Bảo Ngọc', role: 'clinical_lead', status: 'active', lastLogin: '2026-03-21T20:30:00Z', createdAt: '2026-03-19T00:00:00Z' },
  { id: 'user_annotator', email: 'annotator@medicalpower.dev', fullName: 'Nguyễn Thị Mai', role: 'annotator', status: 'active', lastLogin: '2026-03-21T18:00:00Z', createdAt: '2026-03-19T00:00:00Z' },
  { id: 'user_radiologist', email: 'radiologist@medicalpower.dev', fullName: 'BS. Trần Văn Hùng', role: 'radiologist', status: 'active', lastLogin: '2026-03-21T15:00:00Z', createdAt: '2026-03-19T00:00:00Z' },
  { id: 'user_qa', email: 'qa@medicalpower.dev', fullName: 'Lê Minh Tuấn', role: 'qa_reviewer', status: 'blocked', lastLogin: '2026-03-20T10:00:00Z', createdAt: '2026-03-19T00:00:00Z' },
  { id: 'user_viewer', email: 'viewer@medicalpower.dev', fullName: 'Phạm Thị Hoa', role: 'viewer', status: 'pending', lastLogin: null, createdAt: '2026-03-21T00:00:00Z' },
];

export default function UsersPage() {
  const { locale, t } = useLocale();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const vi = locale === 'vi';
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = users.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleBlock = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } as MockUser : u));
  };

  const deleteUser = async (id: string) => {
    const ok = await confirm({
      title: vi ? 'Xóa người dùng' : 'Delete User',
      message: t('admin.users.confirmDelete'),
      confirmLabel: vi ? 'Xóa' : 'Delete',
      cancelLabel: vi ? 'Hủy' : 'Cancel',
      variant: 'destructive',
    });
    if (ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast({ type: 'success', title: vi ? 'Đã xóa' : 'Deleted' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <UserCog className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('admin.users.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.users.count', { count: String(users.length) })}</p>
          </div>
        </div>
        <Button className="gap-1.5" onClick={() => showToast({ type: 'info', title: t('admin.users.add'), message: 'Coming soon' })}>
          <Plus className="h-4 w-4" />
          {t('admin.users.add')}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('admin.users.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="all">{t('admin.users.allRoles')}</option>
              {Object.entries(roleLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">{t('admin.users.column.user')}</th>
                  <th className="px-4 py-3">{t('admin.users.column.role')}</th>
                  <th className="px-4 py-3">{t('admin.users.column.status')}</th>
                  <th className="px-4 py-3">{t('admin.users.column.lastLogin')}</th>
                  <th className="px-4 py-3 text-right">{t('admin.users.column.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={roleColor[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={statusColor[user.status]}>
                        {t('admin.users.status.' + user.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') : t('admin.users.neverLoggedIn')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => toggleBlock(user.id)}
                        >
                          {user.status === 'blocked' ? (
                            <><Shield className="h-3 w-3" /> {t('admin.users.action.unblock')}</>
                          ) : (
                            <><Ban className="h-3 w-3" /> {t('admin.users.action.block')}</>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('admin.users.notFound')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
