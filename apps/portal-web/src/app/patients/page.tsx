'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, RefreshCw, Pencil, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { patientApi, type Patient } from '@/lib/api';
import { mockPatients } from '@/lib/mock-data';
import { useLocale } from '@/lib/locale-context';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

export default function PatientsPage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<{ fullName: string; phone: string; address: string }>>({});
  const vi = locale === 'vi';

  const fetchPatients = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientApi.list({ search: searchQuery || undefined, limit: 50 });
      setPatients(res.data);
      setTotal(res.meta.total);
      setUsingMock(false);
    } catch {
      const filtered = mockPatients.filter(
        (p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.mrn.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setPatients(filtered.map((p) => ({ ...p, organizationId: '', updatedAt: p.createdAt })));
      setTotal(filtered.length);
      setUsingMock(true);
      setError('api_not_ready');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(search); }, [fetchPatients, search]);

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id);
    setEditData({ fullName: patient.fullName, phone: patient.phone || '', address: patient.address || '' });
  };

  const handleSaveEdit = async () => {
    if (!editingId || usingMock) return;
    try {
      await patientApi.update(editingId, editData);
      showToast({ type: 'success', title: vi ? 'Đã cập nhật' : 'Updated' });
      setEditingId(null);
      fetchPatients(search);
    } catch {
      showToast({ type: 'error', title: vi ? 'Lỗi cập nhật' : 'Update failed' });
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (usingMock) return;
    const ok = await confirm({
      title: vi ? 'Xóa bệnh nhân' : 'Delete Patient',
      message: vi ? `Bạn có chắc muốn xóa "${patient.fullName}"? Hành động này không thể hoàn tác.` : `Are you sure you want to delete "${patient.fullName}"? This cannot be undone.`,
      confirmLabel: vi ? 'Xóa' : 'Delete',
      cancelLabel: vi ? 'Hủy' : 'Cancel',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      await patientApi.delete(patient.id);
      showToast({ type: 'success', title: vi ? 'Đã xóa' : 'Deleted' });
      fetchPatients(search);
    } catch {
      showToast({ type: 'error', title: vi ? 'Lỗi xóa' : 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('patient.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('patient.list.count', { count: String(total) })}
            {usingMock && <span className="ml-2 text-amber-600">({t('common.label.sampleData')})</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchPatients(search)}>
            <RefreshCw className="mr-1 h-3 w-3" />{t('common.action.refresh')}
          </Button>
          <Link href="/patients/new">
            <Button><Plus className="mr-2 h-4 w-4" />{t('patient.create.title')}</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {t('common.error.apiNotReady')}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('patient.list.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">{t('common.table.loading')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('patient.field.mrn')}</TableHead>
                  <TableHead>{t('patient.field.fullName')}</TableHead>
                  <TableHead>{t('patient.field.dob')}</TableHead>
                  <TableHead>{t('patient.field.gender')}</TableHead>
                  <TableHead>{t('patient.field.phone')}</TableHead>
                  <TableHead>{t('patient.field.status')}</TableHead>
                  <TableHead className="text-right w-24">{vi ? 'Thao tác' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const isEditing = editingId === patient.id;
                  return (
                    <TableRow
                      key={patient.id}
                      className="group cursor-pointer hover:bg-accent/50"
                      onClick={() => { if (!isEditing) router.push(`/patients/${patient.id}`); }}
                    >
                      <TableCell><span className="font-mono text-sm">{patient.mrn}</span></TableCell>
                      <TableCell onClick={(e) => { if (isEditing) e.stopPropagation(); }}>
                        {isEditing ? (
                          <Input value={editData.fullName || ''} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} className="h-8 text-sm w-48" autoFocus />
                        ) : (
                          <span className="font-medium">{patient.fullName}</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(patient.dob).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</TableCell>
                      <TableCell>{t('patient.field.gender.' + patient.gender)}</TableCell>
                      <TableCell onClick={(e) => { if (isEditing) e.stopPropagation(); }}>
                        {isEditing ? (
                          <Input value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="h-8 text-sm w-36" />
                        ) : (
                          <span className="text-sm">{patient.phone || '—'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                          {patient.status === 'active' ? t('common.status.active') : t('common.status.stopped')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}>
                              <Check className="h-3 w-3" />{vi ? 'Lưu' : 'Save'}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                              {vi ? 'Hủy' : 'Cancel'}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleEdit(patient); }} title={vi ? 'Sửa' : 'Edit'}>
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleDelete(patient); }} title={vi ? 'Xóa' : 'Delete'}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">{t('patient.list.empty')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
