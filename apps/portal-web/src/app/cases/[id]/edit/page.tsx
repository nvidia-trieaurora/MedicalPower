'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { caseApi } from '@/lib/api';
import { useLocale } from '@/lib/locale-context';
import { useToast } from '@/components/ui/toast';

const priorityOptions = [
  { value: 'critical', label: { vi: 'Nghiêm trọng', en: 'Critical' }, color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'high', label: { vi: 'Cao', en: 'High' }, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'normal', label: { vi: 'Bình thường', en: 'Normal' }, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'low', label: { vi: 'Thấp', en: 'Low' }, color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const statusOptions = [
  { value: 'draft', label: { vi: 'Nháp', en: 'Draft' } },
  { value: 'open', label: { vi: 'Mở', en: 'Open' } },
  { value: 'in_progress', label: { vi: 'Đang thực hiện', en: 'In Progress' } },
  { value: 'review', label: { vi: 'Đang duyệt', en: 'Review' } },
  { value: 'completed', label: { vi: 'Hoàn thành', en: 'Completed' } },
  { value: 'closed', label: { vi: 'Đóng', en: 'Closed' } },
];

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const vi = locale === 'vi';
  const lang = vi ? 'vi' : 'en';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [status, setStatus] = useState('open');
  const [slaDeadline, setSlaDeadline] = useState('');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await caseApi.get(id);
        const c = 'data' in res ? (res as any).data : res;
        setTitle(c.title || '');
        setDescription(c.description || '');
        setPriority(c.priority || 'normal');
        setStatus(c.status || 'open');
        setSlaDeadline(c.slaDeadline ? c.slaDeadline.slice(0, 16) : '');
        setPatientName(c.patient?.fullName || '—');
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await caseApi.update(id, { title, description, priority, status, slaDeadline: slaDeadline || null });
      showToast({ type: 'success', title: vi ? 'Đã lưu' : 'Saved' });
      router.push(`/cases/${id}`);
    } catch {
      showToast({ type: 'error', title: vi ? 'Lỗi lưu' : 'Save failed' });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/cases/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{vi ? 'Chỉnh sửa Ca bệnh' : 'Edit Case'}</h1>
          <p className="text-sm text-muted-foreground">{patientName}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{vi ? 'Thông tin' : 'Info'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{vi ? 'Tiêu đề' : 'Title'} *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{vi ? 'Mô tả' : 'Description'}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{vi ? 'Ưu tiên' : 'Priority'}</label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setPriority(opt.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${opt.color} ${
                    priority === opt.value ? 'ring-2 ring-offset-1 ring-current scale-105' : 'opacity-50 hover:opacity-100'
                  }`}>{opt.label[lang]}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{vi ? 'Trạng thái' : 'Status'}</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setStatus(opt.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    status === opt.value ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary' : 'hover:bg-accent/50 text-muted-foreground'
                  }`}>{opt.label[lang]}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{vi ? 'Hạn SLA' : 'SLA Deadline'}</label>
            <Input type="datetime-local" value={slaDeadline} onChange={(e) => setSlaDeadline(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || !title} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {vi ? 'Lưu thay đổi' : 'Save Changes'}
        </Button>
        <Link href={`/cases/${id}`}><Button variant="outline">{vi ? 'Hủy' : 'Cancel'}</Button></Link>
      </div>
    </div>
  );
}
