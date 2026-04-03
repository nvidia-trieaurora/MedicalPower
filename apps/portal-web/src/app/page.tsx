'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  FolderOpen,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardStats, mockCases, mockTasks } from '@/lib/mock-data';
import { caseApi, dashboardApi, taskApi, type Case, type DashboardStats, type Task } from '@/lib/api';
import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';

type RecentCase = Case | (typeof mockCases)[number];
type TaskItem = Task | (typeof mockTasks)[number];

const statDefinitions = [
  { labelKey: 'workflow.dashboard.patients', field: 'totalPatients' as const, icon: Users, href: '/patients', color: 'text-blue-600' },
  { labelKey: 'workflow.dashboard.cases', field: 'totalCases' as const, icon: FolderOpen, href: '/cases', color: 'text-emerald-600' },
  { labelKey: 'workflow.dashboard.activeTasks', field: 'activeTasks' as const, icon: ListTodo, href: '/tasks', color: 'text-amber-600' },
  { labelKey: 'workflow.dashboard.completedToday', field: 'completedToday' as const, icon: CheckCircle2, href: '/tasks', color: 'text-green-600' },
  { labelKey: 'workflow.dashboard.pendingReview', field: 'pendingReview' as const, icon: Clock, href: '/tasks', color: 'text-purple-600' },
  { labelKey: 'workflow.dashboard.slaAtRisk', field: 'slaAtRisk' as const, icon: AlertTriangle, href: '/tasks', color: 'text-red-600' },
];

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  review: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-600',
  assigned: 'bg-blue-100 text-blue-700',
  submitted: 'bg-indigo-100 text-indigo-700',
  in_review: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  created: 'bg-gray-100 text-gray-600',
};

function casePatientDisplay(c: RecentCase): string {
  if ('patient' in c && c.patient?.fullName) return c.patient.fullName;
  if ('patientName' in c) return c.patientName;
  return '';
}

function taskCaseTitle(t: TaskItem): string {
  if ('case' in t && t.case?.title) return t.case.title;
  if ('caseTitle' in t) return t.caseTitle;
  return '';
}

function taskPatientName(t: TaskItem): string {
  if ('case' in t && t.case?.patient?.fullName) return t.case.patient.fullName;
  if ('patientName' in t) return t.patientName;
  return '';
}

function taskModality(t: TaskItem): string {
  if ('modality' in t && t.modality) return t.modality;
  if ('case' in t && t.case?.studyLinks?.[0]?.study?.modality) {
    return t.case.studyLinks[0].study.modality;
  }
  return '';
}

export default function DashboardPage() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<DashboardStats>(dashboardStats);
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [statsRes, casesRes, tasksRes] = await Promise.all([
          dashboardApi.stats(),
          caseApi.list({ limit: 5 }),
          taskApi.list({ limit: 5 }),
        ]);
        if (cancelled) return;
        setStatsData(statsRes);
        setRecentCases(casesRes.data);
        setTasks(tasksRes.data);
      } catch {
        if (cancelled) return;
        setStatsData(dashboardStats);
        setRecentCases(mockCases.slice(0, 5));
        setTasks(mockTasks);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = statDefinitions.map((def) => ({
    ...def,
    value: statsData[def.field],
  }));

  const activeTasks = tasks.filter((task) => !['completed', 'approved'].includes(task.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('workflow.dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('workflow.dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Link key={stat.labelKey} href={stat.href} className={loading ? 'pointer-events-none' : ''}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer py-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">
                    {loading ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{t(stat.labelKey)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">{t('workflow.dashboard.recentCases')}</CardTitle>
            <Link href="/cases">
              <Button variant="ghost" size="sm" className="text-xs">
                {t('common.action.viewAll')} <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-3/4 max-w-[200px] animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 max-w-[140px] animate-pulse rounded bg-muted" />
                    </div>
                    <div className="ml-3 flex gap-2">
                      <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                      <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                    </div>
                  </div>
                ))
              : recentCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{casePatientDisplay(c)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge variant="secondary" className={priorityColor[c.priority]}>
                        {c.priority}
                      </Badge>
                      <Badge variant="secondary" className={statusColor[c.status]}>
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </Link>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">{t('workflow.dashboard.myTasks')}</CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-xs">
                {t('common.action.viewAll')} <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-3/4 max-w-[220px] animate-pulse rounded bg-muted" />
                      <div className="h-3 w-full max-w-[280px] animate-pulse rounded bg-muted" />
                    </div>
                    <div className="ml-3 flex gap-2">
                      <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                      <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                    </div>
                  </div>
                ))
              : activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{taskCaseTitle(task)}</p>
                      <p className="text-xs text-muted-foreground">
                        {taskPatientName(task)} &middot; {taskModality(task)} &middot; {task.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge variant="secondary" className={priorityColor[task.priority]}>
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary" className={statusColor[task.status]}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
