'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockCases, mockStudies, mockTasks } from '@/lib/mock-data';

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-700',
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

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const caseData = mockCases.find((c) => c.id === id);

  if (!caseData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy ca bệnh</p>
      </div>
    );
  }

  const studies = mockStudies.filter((s) => caseData.studyIds.includes(s.id));
  const tasks = mockTasks.filter((t) => t.caseId === caseData.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{caseData.title}</h1>
          <p className="text-sm text-muted-foreground">{caseData.description}</p>
        </div>
        <Badge variant="secondary" className={priorityColor[caseData.priority]}>
          {caseData.priority}
        </Badge>
        <Badge variant="secondary" className={statusColor[caseData.status]}>
          {caseData.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Bệnh nhân:</span>
              <Link href={`/patients/${caseData.patientId}`} className="text-primary hover:underline">
                {caseData.patientName}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phụ trách:</span>
              <span>{caseData.assignedTo || 'Chưa giao'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Người tạo:</span>
              <span>{caseData.createdBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">SLA:</span>
              <span>
                {caseData.slaDeadline
                  ? new Date(caseData.slaDeadline).toLocaleString('vi-VN')
                  : 'Không có'}
              </span>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-1">
              <Tag className="h-4 w-4 text-muted-foreground mr-1" />
              {caseData.taxonomyTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Nghiên cứu hình ảnh ({studies.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {studies.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{s.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.modality} &middot; {s.studyDate} &middot; {s.numSeries} series, {s.numInstances} instances
                  </p>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_OHIF_URL || 'http://localhost:8042'}/ohif/viewer?StudyInstanceUIDs=${s.studyInstanceUid}&caseId=${caseData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  <ExternalLink className="h-3 w-3" />
                  Mở OHIF Viewer
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhiệm vụ ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có nhiệm vụ nào</p>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium capitalize">{task.type}</p>
                <p className="text-xs text-muted-foreground">
                  {task.assignedTo || 'Chưa giao'} &middot; {task.modality}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={statusColor[task.status]}>
                  {task.status.replace('_', ' ')}
                </Badge>
                {task.status === 'in_progress' && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_OHIF_URL || 'http://localhost:8042'}/ohif/viewer?StudyInstanceUIDs=${task.studyUid}&taskId=${task.id}&caseId=${task.caseId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-sm font-medium hover:bg-muted"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Viewer
                  </a>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
