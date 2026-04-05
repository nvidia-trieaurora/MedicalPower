'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, Check, ChevronRight, Loader2, User, FolderOpen,
  ListTodo, GitBranchPlus, Plus, RefreshCw, X, UserPlus, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patientApi, caseApi, taskApi, workflowTemplateApi, permissionApi } from '@/lib/api';
import type { Patient, Case, WorkflowTemplateSummary, UserPermissionInfo, TaskAssignmentInput } from '@/lib/api';
import { PRESET_TEMPLATES } from '@/lib/workflow-presets';
import { useLocale } from '@/lib/locale-context';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

const priorityOptions = [
  { value: 'critical', label: { vi: 'Nghiêm trọng', en: 'Critical' }, color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'high', label: { vi: 'Cao', en: 'High' }, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'normal', label: { vi: 'Bình thường', en: 'Normal' }, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'low', label: { vi: 'Thấp', en: 'Low' }, color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const taskTypeOptions = [
  { value: 'annotate', label: { vi: 'Chú thích (Annotate)', en: 'Annotate' }, desc: { vi: 'Gán nhãn ảnh y khoa trên OHIF', en: 'Label medical images in OHIF' } },
  { value: 'review', label: { vi: 'Duyệt (Review)', en: 'Review' }, desc: { vi: 'Kiểm tra và phê duyệt kết quả', en: 'Check and approve results' } },
  { value: 'diagnose', label: { vi: 'Chẩn đoán (Diagnose)', en: 'Diagnose' }, desc: { vi: 'Đưa ra kết luận lâm sàng', en: 'Provide clinical diagnosis' } },
  { value: 'report', label: { vi: 'Báo cáo (Report)', en: 'Report' }, desc: { vi: 'Tạo báo cáo chẩn đoán', en: 'Create diagnostic report' } },
];

const memberRoleOptions = [
  { value: 'annotator', label: { vi: 'Người chú thích', en: 'Annotator' } },
  { value: 'reviewer', label: { vi: 'Người duyệt', en: 'Reviewer' } },
  { value: 'diagnostician', label: { vi: 'Bác sĩ chẩn đoán', en: 'Diagnostician' } },
];

const memberTaskTypeOptions = [
  { value: 'annotate', label: { vi: 'Chú thích', en: 'Annotate' } },
  { value: 'review', label: { vi: 'Duyệt', en: 'Review' } },
  { value: 'diagnose', label: { vi: 'Chẩn đoán', en: 'Diagnose' } },
  { value: 'report', label: { vi: 'Báo cáo', en: 'Report' } },
];

interface MemberRow {
  userId: string;
  role: string;
  taskType: string;
}

const STEPS = ['patient', 'config', 'confirm'] as const;
type Step = (typeof STEPS)[number];

export default function NewTaskPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const vi = locale === 'vi';
  const lang = vi ? 'vi' : 'en';

  const [step, setStep] = useState<Step>('patient');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Patient + Case
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ mrn: '', fullName: '', dob: '', gender: 'male' });
  const [creatingPatient, setCreatingPatient] = useState(false);

  // Step 2: Task config
  const [taskType, setTaskType] = useState('annotate');
  const [priority, setPriority] = useState('normal');
  const [slaDeadline, setSlaDeadline] = useState('');
  const [workflowTemplateId, setWorkflowTemplateId] = useState('');
  const [templates, setTemplates] = useState<WorkflowTemplateSummary[]>([]);
  const [users, setUsers] = useState<UserPermissionInfo[]>([]);

  // Multi-assignee
  const [projectManagerId, setProjectManagerId] = useState('');
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState<MemberRow>({ userId: '', role: 'annotator', taskType: 'annotate' });

  // Search patients
  useEffect(() => {
    if (!patientSearch.trim()) { setPatients([]); return; }
    const timer = setTimeout(async () => {
      setLoadingPatients(true);
      try {
        const res = await patientApi.list({ search: patientSearch, limit: 8 });
        setPatients(res.data);
      } catch { setPatients([]); }
      setLoadingPatients(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Load cases when patient selected
  useEffect(() => {
    if (!selectedPatient) { setCases([]); return; }
    (async () => {
      setLoadingCases(true);
      try {
        const res = await caseApi.list({ patientId: selectedPatient.id });
        setCases(res.data);
      } catch { setCases([]); }
      setLoadingCases(false);
    })();
  }, [selectedPatient]);

  // Load templates + users on mount
  useEffect(() => {
    (async () => {
      try {
        const tpl = await workflowTemplateApi.list();
        setTemplates(tpl.length > 0 ? tpl : PRESET_TEMPLATES.map((p) => ({ id: p.id, name: p.name, description: p.description, version: String(p.version) })));
      } catch {
        setTemplates(PRESET_TEMPLATES.map((p) => ({ id: p.id, name: p.name, description: p.description, version: String(p.version) })));
      }
      try { const u = await permissionApi.listUsers(); setUsers(u); } catch {}
    })();
  }, []);

  const pmCandidates = useMemo(() => {
    return users.filter((u) =>
      u.roles.some((r) => ['clinical_lead', 'radiologist', 'system_admin', 'org_admin'].includes(r))
    );
  }, [users]);

  const memberCandidates = useMemo(() => {
    const assignedIds = new Set(members.map((m) => m.userId));
    if (projectManagerId) assignedIds.add(projectManagerId);
    return users.filter((u) => !assignedIds.has(u.id));
  }, [users, members, projectManagerId]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setPatientSearch(p.fullName);
    setSelectedCase(null);
  };

  const handleCreatePatient = async () => {
    if (!newPatient.mrn || !newPatient.fullName || !newPatient.dob) return;
    setCreatingPatient(true);
    try {
      const res = await patientApi.create({ ...newPatient, organizationId: 'default' });
      const created = res.data;
      showToast({ type: 'success', title: t('workflow.task.createPatientSuccess') });
      setShowNewPatientForm(false);
      setNewPatient({ mrn: '', fullName: '', dob: '', gender: 'male' });
      handleSelectPatient(created);
    } catch {
      showToast({ type: 'error', title: vi ? 'Tạo bệnh nhân thất bại' : 'Failed to create patient' });
    }
    setCreatingPatient(false);
  };

  const handleRefreshPatients = async () => {
    if (!patientSearch.trim()) return;
    setLoadingPatients(true);
    try {
      const res = await patientApi.list({ search: patientSearch, limit: 8 });
      setPatients(res.data);
    } catch { setPatients([]); }
    setLoadingPatients(false);
  };

  const handleAddMember = () => {
    if (!newMember.userId) return;
    setMembers([...members, { ...newMember }]);
    setNewMember({ userId: '', role: 'annotator', taskType: 'annotate' });
    setAddingMember(false);
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(members.filter((m) => m.userId !== userId));
  };

  const handleSubmit = async () => {
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      const assignments: TaskAssignmentInput[] = [];
      if (projectManagerId) {
        assignments.push({ userId: projectManagerId, role: 'project_manager', taskType: taskType });
      }
      for (const m of members) {
        assignments.push({ userId: m.userId, role: m.role, taskType: m.taskType });
      }

      await taskApi.create({
        caseId: selectedCase.id,
        type: taskType,
        priority,
        assignedToId: projectManagerId || undefined,
        slaDeadline: slaDeadline || undefined,
        workflowRunId: workflowTemplateId || undefined,
        assignments: assignments.length > 0 ? assignments : undefined,
      });

      showToast({ type: 'success', title: vi ? 'Tạo nhiệm vụ thành công' : 'Task created' });
      router.push('/tasks');
    } catch {
      showToast({ type: 'error', title: vi ? 'Không thể tạo nhiệm vụ' : 'Failed to create task' });
    }
    setSubmitting(false);
  };

  const canProceedToConfig = !!selectedCase;
  const canSubmit = !!selectedCase && !!taskType;

  const stepLabels = {
    patient: vi ? 'Chọn bệnh nhân & ca bệnh' : 'Select Patient & Case',
    config: vi ? 'Cấu hình nhiệm vụ' : 'Configure Task',
    confirm: vi ? 'Xác nhận' : 'Confirm',
  };

  const getUserName = (userId: string) => users.find((u) => u.id === userId)?.fullName || '—';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tasks"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{vi ? 'Tạo Nhiệm vụ mới' : 'New Task'}</h1>
          <p className="text-sm text-muted-foreground">{stepLabels[step]}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => { if (s === 'patient' || (s === 'config' && canProceedToConfig) || (s === 'confirm' && canSubmit)) setStep(s); }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === s ? 'bg-primary text-primary-foreground' : STEPS.indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {STEPS.indexOf(step) > i ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${STEPS.indexOf(step) > i ? 'bg-green-500' : 'bg-muted'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{stepLabels[step]}</span>
      </div>

      {/* ============ Step 1: Patient + Case ============ */}
      {step === 'patient' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" />{vi ? 'Tìm bệnh nhân' : 'Search Patient'}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefreshPatients} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />{t('workflow.task.refreshPatients')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowNewPatientForm(!showNewPatientForm)} className="gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" />{t('workflow.task.createPatient')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={vi ? 'Nhập tên hoặc MRN...' : 'Type name or MRN...'} value={patientSearch}
                  onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); setSelectedCase(null); }} className="pl-9" />
              </div>

              {loadingPatients && <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>}

              {patients.length > 0 && !selectedPatient && (
                <div className="mt-2 divide-y rounded-lg border">
                  {patients.map((p) => (
                    <button key={p.id} type="button" onClick={() => handleSelectPatient(p)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{p.fullName.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{p.fullName}</p>
                        <p className="text-xs text-muted-foreground">MRN: {p.mrn}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3 flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div><p className="text-sm font-medium">{selectedPatient.fullName}</p><p className="text-xs text-muted-foreground">MRN: {selectedPatient.mrn}</p></div>
                  <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => { setSelectedPatient(null); setPatientSearch(''); setSelectedCase(null); }}>
                    {vi ? 'Đổi' : 'Change'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inline New Patient Form */}
          {showNewPatientForm && (
            <Card className="border-dashed border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="h-4 w-4" />{t('workflow.task.createPatientForm')}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowNewPatientForm(false)}><X className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t('patient.field.fullName')} *</label>
                    <Input value={newPatient.fullName} onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                      placeholder={vi ? 'Họ và tên' : 'Full name'} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t('patient.field.mrn')} *</label>
                    <Input value={newPatient.mrn} onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })}
                      placeholder="MRN" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t('patient.field.dob')} *</label>
                    <Input type="date" value={newPatient.dob} onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t('patient.field.gender')}</label>
                    <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('patient.field.gender.male')}</SelectItem>
                        <SelectItem value="female">{t('patient.field.gender.female')}</SelectItem>
                        <SelectItem value="other">{t('patient.field.gender.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowNewPatientForm(false)}>{t('common.action.cancel')}</Button>
                  <Button size="sm" onClick={handleCreatePatient} disabled={creatingPatient || !newPatient.mrn || !newPatient.fullName || !newPatient.dob} className="gap-1.5">
                    {creatingPatient ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    {t('common.action.create')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedPatient && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FolderOpen className="h-4 w-4" />{vi ? 'Chọn ca bệnh' : 'Select Case'}</CardTitle></CardHeader>
              <CardContent>
                {loadingCases ? <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div> : (
                  <div className="space-y-2">
                    {cases.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">{vi ? 'Chưa có ca bệnh nào' : 'No cases found'}</p>}
                    {cases.map((c) => (
                      <button key={c.id} type="button" onClick={() => setSelectedCase(c)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          selectedCase?.id === c.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
                        }`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{c.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px]">{c.priority}</Badge>
                            <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                          </div>
                        </div>
                        {selectedCase?.id === c.id && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button disabled={!canProceedToConfig} onClick={() => setStep('config')} className="gap-2">
              {vi ? 'Tiếp theo' : 'Next'} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============ Step 2: Task config ============ */}
      {step === 'config' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ListTodo className="h-4 w-4" />{vi ? 'Cấu hình nhiệm vụ' : 'Task Configuration'}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {/* Task type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{vi ? 'Loại nhiệm vụ' : 'Task Type'} *</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {taskTypeOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setTaskType(opt.value)}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                        taskType === opt.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
                      }`}>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{opt.label[lang]}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc[lang]}</p>
                      </div>
                      {taskType === opt.value && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{vi ? 'Ưu tiên' : 'Priority'}</label>
                <div className="flex gap-2">
                  {priorityOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setPriority(opt.value)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${opt.color} ${
                        priority === opt.value ? 'ring-2 ring-offset-1 ring-current scale-105' : 'opacity-60 hover:opacity-100'
                      }`}>
                      {opt.label[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLA */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{vi ? 'Hạn SLA' : 'SLA Deadline'}</label>
                <Input type="datetime-local" value={slaDeadline} onChange={(e) => setSlaDeadline(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Team Assignment */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />{t('workflow.task.assignment.title')}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {/* Project Manager (1 person) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('workflow.task.assignment.projectManager')}</label>
                <Select value={projectManagerId} onValueChange={setProjectManagerId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('workflow.task.assignment.projectManagerHint')}>
                      {projectManagerId ? pmCandidates.find((u) => u.id === projectManagerId)?.fullName || projectManagerId : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {pmCandidates.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{u.fullName.charAt(0)}</div>
                          <span>{u.fullName}</span>
                          <span className="text-xs text-muted-foreground">({u.roles.join(', ')})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">{t('workflow.task.assignment.projectManagerHint')}</p>
              </div>

              {/* Members table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t('workflow.task.assignment.members')}</label>
                  <Button variant="outline" size="sm" onClick={() => setAddingMember(true)} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />{t('workflow.task.assignment.addMember')}
                  </Button>
                </div>

                {members.length === 0 && !addingMember && (
                  <p className="text-sm text-muted-foreground py-4 text-center">{t('workflow.task.assignment.noMembers')}</p>
                )}

                {(members.length > 0 || addingMember) && (
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium">{t('workflow.task.assignment.name')}</th>
                          <th className="px-4 py-2 text-left font-medium">{t('workflow.task.assignment.role')}</th>
                          <th className="px-4 py-2 text-left font-medium">{t('workflow.task.assignment.taskType')}</th>
                          <th className="px-4 py-2 w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => (
                          <tr key={m.userId} className="border-b last:border-0">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                  {getUserName(m.userId).charAt(0)}
                                </div>
                                <span>{getUserName(m.userId)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <Badge variant="outline" className="text-xs">
                                {t('workflow.task.assignment.role.' + m.role)}
                              </Badge>
                            </td>
                            <td className="px-4 py-2">
                              <Badge variant="secondary" className="text-xs">
                                {taskTypeOptions.find((o) => o.value === m.taskType)?.label[lang] || m.taskType}
                              </Badge>
                            </td>
                            <td className="px-4 py-2">
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.userId)} className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}

                        {/* Add member inline row */}
                        {addingMember && (
                          <tr className="border-b last:border-0 bg-accent/30">
                            <td className="px-4 py-2">
                              <Select value={newMember.userId} onValueChange={(v) => setNewMember({ ...newMember, userId: v })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('workflow.task.assignment.selectDoctor')} /></SelectTrigger>
                                <SelectContent>
                                  {memberCandidates.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                      <span>{u.fullName}</span>
                                      <span className="text-xs text-muted-foreground ml-1">({u.roles.join(', ')})</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-2">
                              <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {memberRoleOptions.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label[lang]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-2">
                              <Select value={newMember.taskType} onValueChange={(v) => setNewMember({ ...newMember, taskType: v })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {memberTaskTypeOptions.map((tt) => (
                                    <SelectItem key={tt.value} value={tt.value}>{tt.label[lang]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={handleAddMember} disabled={!newMember.userId} className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50">
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setAddingMember(false)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {members.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {t('workflow.task.assignment.assignedMembers', { count: String(members.length) })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Workflow template */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><GitBranchPlus className="h-4 w-4" />{vi ? 'Chọn quy trình' : 'Select Workflow'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map((tpl) => (
                  <button key={tpl.id} type="button" onClick={() => setWorkflowTemplateId(workflowTemplateId === tpl.id ? '' : tpl.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      workflowTemplateId === tpl.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
                    }`}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <GitBranchPlus className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <p className="text-xs text-muted-foreground">{tpl.description || ''}</p>
                    </div>
                    {workflowTemplateId === tpl.id && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                ))}
                <p className="text-[11px] text-muted-foreground">{vi ? 'Chọn quy trình phù hợp cho nhiệm vụ' : 'Select a workflow for this task'}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('patient')}>{vi ? 'Quay lại' : 'Back'}</Button>
            <Button disabled={!canSubmit} onClick={() => setStep('confirm')} className="gap-2">{vi ? 'Tiếp theo' : 'Next'} <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* ============ Step 3: Confirm ============ */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{vi ? 'Xác nhận tạo nhiệm vụ' : 'Confirm Task Creation'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{vi ? 'Bệnh nhân' : 'Patient'}</span>
                  <span className="font-medium">{selectedPatient?.fullName} (MRN: {selectedPatient?.mrn})</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{vi ? 'Ca bệnh' : 'Case'}</span>
                  <span className="font-medium">{selectedCase?.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{vi ? 'Loại nhiệm vụ' : 'Type'}</span>
                  <span className="font-medium">{taskTypeOptions.find((o) => o.value === taskType)?.label[lang] || taskType}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{vi ? 'Ưu tiên' : 'Priority'}</span>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${priorityOptions.find((o) => o.value === priority)?.color || ''}`}>
                    {priorityOptions.find((o) => o.value === priority)?.label[lang] || priority}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{vi ? 'Quản lý dự án' : 'Project Manager'}</span>
                  <span className="font-medium">{projectManagerId ? getUserName(projectManagerId) : vi ? 'Chưa gán' : 'Unassigned'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{vi ? 'Hạn SLA' : 'SLA'}</span>
                  <span>{slaDeadline ? new Date(slaDeadline).toLocaleString(vi ? 'vi-VN' : 'en-US') : '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{vi ? 'Quy trình' : 'Workflow'}</span>
                  <span>{workflowTemplateId ? templates.find((tp) => tp.id === workflowTemplateId)?.name : vi ? 'Không chọn' : 'None'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team summary */}
          {members.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />{t('workflow.task.assignment.members')} ({members.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium">{t('workflow.task.assignment.name')}</th>
                        <th className="px-4 py-2 text-left font-medium">{t('workflow.task.assignment.role')}</th>
                        <th className="px-4 py-2 text-left font-medium">{t('workflow.task.assignment.taskType')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.userId} className="border-b last:border-0">
                          <td className="px-4 py-2">{getUserName(m.userId)}</td>
                          <td className="px-4 py-2"><Badge variant="outline" className="text-xs">{t('workflow.task.assignment.role.' + m.role)}</Badge></td>
                          <td className="px-4 py-2"><Badge variant="secondary" className="text-xs">{taskTypeOptions.find((o) => o.value === m.taskType)?.label[lang] || m.taskType}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('config')}>{vi ? 'Quay lại' : 'Back'}</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {vi ? 'Tạo nhiệm vụ' : 'Create Task'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
