'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Filter, Play, Send, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { taskApi, type Task as ApiTask } from '@/lib/api';
import { mockTasks, type Task as MockTask } from '@/lib/mock-data';
import { getViewerUrl } from '@/lib/viewer';
import { useLocale } from '@/lib/locale-context';
import { useToast } from '@/components/ui/toast';

type TaskRow = MockTask | ApiTask;

function getCaseTitle(task: TaskRow): string {
  if ('caseTitle' in task && task.caseTitle) return task.caseTitle;
  if ('case' in task && task.case?.title) return task.case.title;
  return '—';
}

function getPatientName(task: TaskRow): string {
  if ('patientName' in task && task.patientName) return task.patientName;
  if ('case' in task && task.case?.patient?.fullName) return task.case.patient.fullName;
  return '—';
}

function getStudyUid(task: TaskRow): string {
  if ('studyUid' in task && task.studyUid) return task.studyUid;
  if ('case' in task) return task.case?.studyLinks?.[0]?.study.studyInstanceUid ?? '';
  return '';
}

function getModality(task: TaskRow): string {
  if ('modality' in task && task.modality) return task.modality;
  if ('case' in task) return task.case?.studyLinks?.[0]?.study.modality ?? '—';
  return '—';
}

function getAssignedToName(task: TaskRow): string | null {
  const a = task.assignedTo;
  if (a == null) return null;
  if (typeof a === 'string') return a;
  return a.fullName ?? null;
}

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-700',
};

const statusColor: Record<string, string> = {
  created: 'bg-gray-100 text-gray-600',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  submitted: 'bg-indigo-100 text-indigo-700',
  in_review: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
};

function TaskCard({ task, onRefresh }: { task: TaskRow; onRefresh: () => void }) {
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const handleTransition = async (action: string) => {
    setActionLoading(true);
    try {
      await taskApi.transition(task.id, action);
      showToast({ type: 'success', title: t('workflow.task.status.' + action) || action });
      onRefresh();
    } catch {
      showToast({ type: 'error', title: vi ? 'Thao tác thất bại' : 'Action failed' });
    }
    setActionLoading(false);
  };

  const vi = locale === 'vi';

  const viewerUrl = getViewerUrl({
    studyInstanceUid: getStudyUid(task),
    taskId: task.id,
    caseId: task.caseId,
    patientName: getPatientName(task),
    taskType: task.type,
  });

  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  const handleCardClick = () => { window.location.href = `/tasks/${task.id}`; };

  return (
    <div onClick={handleCardClick} className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 cursor-pointer">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{getCaseTitle(task)}</p>
          <Badge variant="secondary" className={priorityColor[task.priority]}>
            {task.priority}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {getPatientName(task)} &middot;
          <Badge variant="outline" className="mx-1 text-[10px] px-1.5 py-0">{getModality(task)}</Badge>
          &middot; {t('workflow.task.type.' + task.type)}
        </p>
        {task.slaDeadline && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t('common.label.deadline', { deadline: new Date(task.slaDeadline).toLocaleString(dateLocale) })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
        <Badge variant="secondary" className={statusColor[task.status]}>
          {t('workflow.task.status.' + task.status)}
        </Badge>

        {task.status === 'assigned' && (
          <Button size="sm" variant="default" disabled={actionLoading} onClick={() => handleTransition('start')}>
            <Play className="mr-1 h-3 w-3" />
            {t('workflow.task.action.start')}
          </Button>
        )}

        {task.status === 'in_progress' && (
          <>
            <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="default" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
                <ExternalLink className="h-3.5 w-3.5" />
                {t('common.action.openViewer')}
              </Button>
            </a>
            <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => handleTransition('submit')}>
              <Send className="mr-1 h-3 w-3" />
              {t('common.action.submitReview')}
            </Button>
          </>
        )}

        {task.status === 'in_review' && (
          <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="default" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
              <Eye className="h-3.5 w-3.5" />
              {t('common.action.viewAndReview')}
            </Button>
          </a>
        )}

        {['completed', 'approved'].includes(task.status) && (
          <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground transition-all duration-200 hover:scale-105 hover:text-foreground active:scale-95">
              <Eye className="h-3.5 w-3.5" />
              {t('common.action.view')}
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { t } = useLocale();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<TaskRow[]>(mockTasks);

  const refreshTasks = async () => {
    try {
      const res = await taskApi.list();
      setTasks(res.data);
    } catch {
      setTasks(mockTasks);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const myTasks = tasks.filter((task) => getAssignedToName(task) === 'Nguyễn Thị Mai');
  const activeTasks = tasks.filter((task) => !['completed', 'approved'].includes(task.status));
  const completedTasks = tasks.filter((task) => ['completed', 'approved'].includes(task.status));

  const filterByType = (list: TaskRow[]) =>
    typeFilter === 'all' ? list : list.filter((task) => task.type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('workflow.task.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('workflow.task.activeCount', { count: String(activeTasks.length) })}
          </p>
        </div>
        <div className="flex items-center gap-2">
        <Link href="/tasks/new">
          <Button className="gap-1.5"><Plus className="h-4 w-4" />{t('workflow.task.create')}</Button>
        </Link>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t('workflow.task.filter.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('workflow.task.filter.all')}</SelectItem>
            <SelectItem value="annotate">{t('workflow.task.type.annotate')}</SelectItem>
            <SelectItem value="review">{t('workflow.task.type.review')}</SelectItem>
            <SelectItem value="adjudicate">{t('workflow.task.type.adjudicate')}</SelectItem>
            <SelectItem value="diagnose">{t('workflow.task.type.diagnose')}</SelectItem>
            <SelectItem value="report">{t('workflow.task.type.report')}</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">{t('workflow.task.myTasks')} ({myTasks.length})</TabsTrigger>
          <TabsTrigger value="active">{t('workflow.task.active')} ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">{t('workflow.task.completed')} ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-4 space-y-3">
          {filterByType(myTasks).length === 0 && (
            <Card>
              <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
                {t('workflow.task.empty')}
              </CardContent>
            </Card>
          )}
          {filterByType(myTasks).map((task) => (
            <TaskCard key={task.id} task={task} onRefresh={refreshTasks} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-3">
          {filterByType(activeTasks).map((task) => (
            <TaskCard key={task.id} task={task} onRefresh={refreshTasks} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {filterByType(completedTasks).map((task) => (
            <TaskCard key={task.id} task={task} onRefresh={refreshTasks} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
