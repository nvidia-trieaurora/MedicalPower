'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Filter, Play, Send, Eye } from 'lucide-react';
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
import { mockTasks } from '@/lib/mock-data';

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

const statusLabel: Record<string, string> = {
  created: 'Đã tạo',
  assigned: 'Đã giao',
  in_progress: 'Đang thực hiện',
  submitted: 'Đã gửi',
  in_review: 'Đang duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  completed: 'Hoàn thành',
};

const typeLabel: Record<string, string> = {
  annotate: 'Chú thích',
  review: 'Duyệt',
  adjudicate: 'Phân xử',
  diagnose: 'Chẩn đoán',
  report: 'Báo cáo',
};

function TaskCard({ task }: { task: (typeof mockTasks)[0] }) {
  const ohifBase = process.env.NEXT_PUBLIC_OHIF_URL || 'http://localhost:8042';
  const viewerUrl = `${ohifBase}/ohif/viewer?StudyInstanceUIDs=${task.studyUid}&taskId=${task.id}&caseId=${task.caseId}&patientName=${encodeURIComponent(task.patientName)}&taskType=${task.type}`;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{task.caseTitle}</p>
          <Badge variant="secondary" className={priorityColor[task.priority]}>
            {task.priority}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {task.patientName} &middot; {task.modality} &middot; {typeLabel[task.type]}
        </p>
        {task.slaDeadline && (
          <p className="mt-1 text-xs text-muted-foreground">
            Hạn: {new Date(task.slaDeadline).toLocaleString('vi-VN')}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Badge variant="secondary" className={statusColor[task.status]}>
          {statusLabel[task.status]}
        </Badge>

        {task.status === 'assigned' && (
          <Button size="sm" variant="default" onClick={() => alert(`Bắt đầu task ${task.id} (Demo)`)}>
            <Play className="mr-1 h-3 w-3" />
            Bắt đầu
          </Button>
        )}

        {task.status === 'in_progress' && (
          <>
            <a
              href={viewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              <ExternalLink className="h-3 w-3" />
              Mở Viewer
            </a>
            <Button size="sm" variant="outline" onClick={() => alert(`Gửi duyệt task ${task.id} (Demo)`)}>
              <Send className="mr-1 h-3 w-3" />
              Gửi duyệt
            </Button>
          </>
        )}

        {task.status === 'in_review' && (
          <a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            <Eye className="h-3 w-3" />
            Xem & Duyệt
          </a>
        )}

        {['completed', 'approved'].includes(task.status) && (
          <a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Eye className="h-3 w-3" />
            Xem
          </a>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const myTasks = mockTasks.filter((t) => t.assignedTo === 'Nguyễn Thị Mai');
  const activeTasks = mockTasks.filter((t) => !['completed', 'approved'].includes(t.status));
  const completedTasks = mockTasks.filter((t) => ['completed', 'approved'].includes(t.status));

  const filterByType = (tasks: typeof mockTasks) =>
    typeFilter === 'all' ? tasks : tasks.filter((t) => t.type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Nhiệm vụ</h1>
          <p className="text-sm text-muted-foreground">
            {activeTasks.length} nhiệm vụ đang hoạt động
          </p>
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="annotate">Chú thích</SelectItem>
            <SelectItem value="review">Duyệt</SelectItem>
            <SelectItem value="adjudicate">Phân xử</SelectItem>
            <SelectItem value="diagnose">Chẩn đoán</SelectItem>
            <SelectItem value="report">Báo cáo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">Của tôi ({myTasks.length})</TabsTrigger>
          <TabsTrigger value="active">Đang hoạt động ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-4 space-y-3">
          {filterByType(myTasks).length === 0 && (
            <Card>
              <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
                Không có nhiệm vụ nào
              </CardContent>
            </Card>
          )}
          {filterByType(myTasks).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-3">
          {filterByType(activeTasks).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {filterByType(completedTasks).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
