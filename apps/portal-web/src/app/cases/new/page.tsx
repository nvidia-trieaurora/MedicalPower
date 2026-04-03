'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patientApi, caseApi } from '@/lib/api';
import type { Patient } from '@/lib/api';
import { useLocale } from '@/lib/locale-context';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';

const priorityOptions = [
  { value: 'critical', label: { vi: 'Nghiêm trọng', en: 'Critical' }, color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'high', label: { vi: 'Cao', en: 'High' }, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'normal', label: { vi: 'Bình thường', en: 'Normal' }, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'low', label: { vi: 'Thấp', en: 'Low' }, color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

export default function NewCasePage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const { user } = useAuth();
  const vi = locale === 'vi';
  const lang = vi ? 'vi' : 'en';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [slaDeadline, setSlaDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedStudyIds, setSelectedStudyIds] = useState<string[]>([]);

  useEffect(() => {
    if (!patientSearch.trim()) { setPatients([]); return; }
    const timer = setTimeout(async () => {
      setLoadingPatients(true);
      try { const res = await patientApi.list({ search: patientSearch, limit: 8 }); setPatients(res.data); } catch { setPatients([]); }
      setLoadingPatients(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setPatientSearch(p.fullName);
    setSelectedStudyIds([]);
  };

  const toggleStudy = (studyId: string) => {
    setSelectedStudyIds((prev) => prev.includes(studyId) ? prev.filter((id) => id !== studyId) : [...prev, studyId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedPatient) return;
    setSubmitting(true);
    try {
      await caseApi.create({
        title,
        description: description || undefined,
        patientId: selectedPatient.id,
        organizationId: 'org_001',
        priority,
        status: 'open',
        createdById: user?.id || 'unknown',
        slaDeadline: slaDeadline || undefined,
      });
      showToast({ type: 'success', title: vi ? 'Tạo ca bệnh thành công' : 'Case created' });
      router.push('/cases');
    } catch {
      showToast({ type: 'error', title: vi ? 'Không thể tạo ca bệnh' : 'Failed to create case' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/cases"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{vi ? 'Tạo Ca bệnh mới' : 'New Case'}</h1>
          <p className="text-sm text-muted-foreground">{vi ? 'Liên kết bệnh nhân, ảnh y khoa và phân loại' : 'Link patient, studies, and classify'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Case info */}
        <Card>
          <CardHeader><CardTitle className="text-base">{vi ? 'Thông tin ca bệnh' : 'Case Info'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{vi ? 'Tiêu đề' : 'Title'} *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: CT Chest - Lung nodule evaluation" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{vi ? 'Mô tả' : 'Description'}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={vi ? 'Mô tả chi tiết...' : 'Details...'} rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            {/* Priority chips */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{vi ? 'Ưu tiên' : 'Priority'} *</label>
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
              <label className="text-sm font-medium">{vi ? 'Hạn SLA' : 'SLA Deadline'}</label>
              <Input type="datetime-local" value={slaDeadline} onChange={(e) => setSlaDeadline(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Patient search */}
        <Card>
          <CardHeader><CardTitle className="text-base">{vi ? 'Bệnh nhân' : 'Patient'} *</CardTitle></CardHeader>
          <CardContent>
            {selectedPatient ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
                <Check className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedPatient.fullName}</p>
                  <p className="text-xs text-muted-foreground">MRN: {selectedPatient.mrn}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}>
                  {vi ? 'Đổi' : 'Change'}
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder={vi ? 'Tìm bệnh nhân...' : 'Search patient...'} value={patientSearch}
                    onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); }} className="pl-9" />
                </div>
                {loadingPatients && <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin" /></div>}
                {patients.length > 0 && (
                  <div className="mt-2 divide-y rounded-lg border">
                    {patients.map((p) => (
                      <button key={p.id} type="button" onClick={() => handleSelectPatient(p)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{p.fullName.charAt(0)}</div>
                        <div className="flex-1"><p className="text-sm font-medium">{p.fullName}</p><p className="text-xs text-muted-foreground">MRN: {p.mrn}</p></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Studies of selected patient */}
            {selectedPatient?.studies && selectedPatient.studies.length > 0 && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">{vi ? 'Liên kết ảnh y khoa' : 'Link Studies'}</label>
                {selectedPatient.studies.map((s) => (
                  <button key={s.id} type="button" onClick={() => toggleStudy(s.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      selectedStudyIds.includes(s.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
                    }`}>
                    <div className="flex-1">
                      <p className="text-sm">{s.description || 'No description'}</p>
                      <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.modality}</Badge>
                        <span>{s.studyDate}</span>
                        <span>{s.numInstances} ảnh</span>
                      </div>
                    </div>
                    {selectedStudyIds.includes(s.id) && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || !title || !selectedPatient} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {vi ? 'Tạo Ca bệnh' : 'Create Case'}
          </Button>
          <Link href="/cases"><Button type="button" variant="outline">{vi ? 'Hủy' : 'Cancel'}</Button></Link>
        </div>
      </form>
    </div>
  );
}
