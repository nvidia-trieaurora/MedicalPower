'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Clock, User, Tag, ImageIcon, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { caseApi, type Case } from '@/lib/api';
import { getViewerUrl } from '@/lib/viewer';
import { useLocale } from '@/lib/locale-context';

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800', low: 'bg-gray-100 text-gray-700',
};
const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700', open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700', review: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700', closed: 'bg-gray-200 text-gray-600',
  assigned: 'bg-blue-100 text-blue-700', submitted: 'bg-indigo-100 text-indigo-700',
  in_review: 'bg-purple-100 text-purple-700', approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700', created: 'bg-gray-100 text-gray-600',
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const vi = locale === 'vi';
  const dateLocale = vi ? 'vi-VN' : 'en-US';

  useEffect(() => {
    (async () => {
      try {
        const res = await caseApi.get(id);
        setCaseData('data' in res ? (res as any).data : res);
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (!caseData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">{t('case.detail.notFound')}</p>
      </div>
    );
  }

  const studies = caseData.studyLinks?.map((sl: any) => sl.study).filter(Boolean) || [];
  const tasks = caseData.tasks || [];
  const patient = caseData.patient;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/cases">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{caseData.title}</h1>
          <p className="text-sm text-muted-foreground">{caseData.description}</p>
        </div>
        <Badge variant="secondary" className={priorityColor[caseData.priority]}>{caseData.priority}</Badge>
        <Badge variant="secondary" className={statusColor[caseData.status]}>{t('case.status.' + caseData.status)}</Badge>
        <Link href={`/cases/${id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" />{vi ? 'Sửa' : 'Edit'}</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('case.detail.info')}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('case.detail.patient')}:</span>
              {patient ? (
                <Link href={`/patients/${patient.id}`} className="text-primary hover:underline">{patient.fullName}</Link>
              ) : '—'}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('case.detail.createdBy')}:</span>
              <span>{caseData.createdBy?.fullName || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">SLA:</span>
              <span>{caseData.slaDeadline ? new Date(caseData.slaDeadline).toLocaleString(dateLocale) : '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{vi ? 'Ngày tạo' : 'Created'}:</span>
              <span>{new Date(caseData.createdAt).toLocaleDateString(dateLocale)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" />
              {vi ? `Ảnh y khoa (${studies.length})` : `Studies (${studies.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {studies.length === 0 && <p className="text-sm text-muted-foreground">{vi ? 'Chưa có ảnh liên kết' : 'No linked studies'}</p>}
            {studies.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.description || 'No description'}</p>
                  <p className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-1.5 text-[10px] px-1.5 py-0">{s.modality}</Badge>
                    {s.studyDate ? new Date(s.studyDate).toLocaleDateString(dateLocale) : '?'} · {s.numInstances || '?'} {vi ? 'ảnh' : 'images'}
                  </p>
                </div>
                <a href={getViewerUrl({ studyInstanceUid: s.studyInstanceUid, caseId: id, patientName: patient?.fullName })} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="default" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('common.action.openViewer')}
                  </Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{vi ? `Nhiệm vụ (${tasks.length})` : `Tasks (${tasks.length})`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 && <p className="text-sm text-muted-foreground">{vi ? 'Chưa có nhiệm vụ' : 'No tasks'}</p>}
          {tasks.map((task: any) => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t('workflow.task.type.' + task.type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignedTo?.fullName || (vi ? 'Chưa gán' : 'Unassigned')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={statusColor[task.status]}>{t('workflow.task.status.' + task.status)}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
