'use client';

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
import Link from 'next/link';

const stats = [
  { label: 'Bệnh nhân', value: dashboardStats.totalPatients, icon: Users, href: '/patients', color: 'text-blue-600' },
  { label: 'Ca bệnh', value: dashboardStats.totalCases, icon: FolderOpen, href: '/cases', color: 'text-emerald-600' },
  { label: 'Nhiệm vụ đang xử lý', value: dashboardStats.activeTasks, icon: ListTodo, href: '/tasks', color: 'text-amber-600' },
  { label: 'Hoàn thành hôm nay', value: dashboardStats.completedToday, icon: CheckCircle2, href: '/tasks', color: 'text-green-600' },
  { label: 'Chờ duyệt', value: dashboardStats.pendingReview, icon: Clock, href: '/tasks', color: 'text-purple-600' },
  { label: 'SLA sắp hết hạn', value: dashboardStats.slaAtRisk, icon: AlertTriangle, href: '/tasks', color: 'text-red-600' },
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

export default function DashboardPage() {
  const recentCases = mockCases.slice(0, 4);
  const activeTasks = mockTasks.filter((t) => !['completed', 'approved'].includes(t.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan hoạt động hệ thống MedicalPower
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer py-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Ca bệnh gần đây</CardTitle>
            <Link href="/cases">
              <Button variant="ghost" size="sm" className="text-xs">
                Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.patientName}</p>
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
            <CardTitle className="text-base font-semibold">Nhiệm vụ của tôi</CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-xs">
                Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.caseTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.patientName} &middot; {task.modality} &middot; {task.type}
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
