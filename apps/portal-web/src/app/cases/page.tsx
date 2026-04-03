'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Pencil, Trash2, CalendarDays, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { caseApi, type Case } from '@/lib/api';
import { mockCases } from '@/lib/mock-data';
import { useLocale } from '@/lib/locale-context';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800', low: 'bg-gray-100 text-gray-700',
};
const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700', open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700', review: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700', closed: 'bg-gray-200 text-gray-600',
};
const STATUS_VALUES = ['draft', 'open', 'in_progress', 'review', 'completed', 'closed'] as const;

type CaseRow = Case & { patientName?: string; taxonomyTags?: string[] };
function patientDisplay(c: CaseRow) { return c.patient?.fullName ?? c.patientName ?? '—'; }

export default function CasesPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const vi = locale === 'vi';

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await caseApi.list({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setCases(res.data);
    } catch {
      setCases(mockCases as any);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCases(); }, [searchQuery, statusFilter]);

  const filteredCases = useMemo(() => {
    let result = cases;
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((c) => new Date(c.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      result = result.filter((c) => new Date(c.createdAt) <= to);
    }
    return result;
  }, [cases, dateFrom, dateTo]);

  const handleDelete = async (c: Case) => {
    const ok = await confirm({
      title: vi ? 'Xóa ca bệnh' : 'Delete Case',
      message: vi ? `Bạn có chắc muốn xóa "${c.title}"? Hành động này không thể hoàn tác.` : `Are you sure you want to delete "${c.title}"? This cannot be undone.`,
      confirmLabel: vi ? 'Xóa' : 'Delete',
      cancelLabel: vi ? 'Hủy' : 'Cancel',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      await caseApi.delete(c.id);
      showToast({ type: 'success', title: vi ? 'Đã xóa' : 'Deleted' });
      fetchCases();
    } catch {
      showToast({ type: 'error', title: vi ? 'Lỗi xóa' : 'Delete failed' });
    }
  };

  const dateLocale = vi ? 'vi-VN' : 'en-US';
  const hasDateFilter = dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('case.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('case.list.count', { count: String(filteredCases.length) })}</p>
        </div>
        <Link href="/cases/new"><Button><Plus className="mr-2 h-4 w-4" />{t('case.create.title')}</Button></Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search - tìm theo tiêu đề + bệnh nhân */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={vi ? 'Tìm tiêu đề, bệnh nhân...' : 'Search title, patient...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('case.field.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{vi ? 'Tất cả' : 'All'}</SelectItem>
                {STATUS_VALUES.map((s) => <SelectItem key={s} value={s}>{t('case.status.' + s)}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Date range filter */}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-36 text-sm" placeholder={vi ? 'Từ ngày' : 'From'} />
              <span className="text-muted-foreground text-xs">→</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-36 text-sm" placeholder={vi ? 'Đến ngày' : 'To'} />
              {hasDateFilter && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">{t('common.table.loading')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('case.field.title')}</TableHead>
                  <TableHead>{t('case.detail.patient')}</TableHead>
                  <TableHead>{t('case.field.priority')}</TableHead>
                  <TableHead>{t('case.field.status')}</TableHead>
                  <TableHead>{vi ? 'Ngày tạo' : 'Created'}</TableHead>
                  <TableHead>{t('case.detail.assignedTo')}</TableHead>
                  <TableHead>{t('case.field.slaDeadline')}</TableHead>
                  <TableHead className="text-right w-20">{vi ? 'Thao tác' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => {
                  const row = c as CaseRow;
                  return (
                    <TableRow key={c.id} className="group cursor-pointer hover:bg-accent/50" onClick={() => router.push(`/cases/${c.id}`)}>
                      <TableCell>
                        <span className="text-sm font-medium">{c.title}</span>
                        <div className="flex gap-1 mt-1">
                          {row.taxonomyTags?.map((tag) => <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{patientDisplay(row)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={priorityColor[c.priority] ?? 'bg-gray-100'}>
                          {t('case.field.priority.' + c.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColor[c.status] ?? 'bg-gray-100'}>
                          {t('case.status.' + c.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-sm">{c.assignedTo || '—'}</TableCell>
                      <TableCell className="text-sm">
                        {c.slaDeadline
                          ? new Date(c.slaDeadline).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={vi ? 'Sửa' : 'Edit'}
                            onClick={(e) => { e.stopPropagation(); router.push(`/cases/${c.id}/edit`); }}>
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={vi ? 'Xóa' : 'Delete'}
                            onClick={(e) => { e.stopPropagation(); handleDelete(c); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCases.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">{t('case.list.empty')}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
