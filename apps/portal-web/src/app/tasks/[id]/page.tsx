'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, User, Clock, Tag, Play, Send, CheckCircle, XCircle, Loader2, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taskApi } from '@/lib/api';
import { getViewerUrl } from '@/lib/viewer';
import { useLocale } from '@/lib/locale-context';
import { useToast } from '@/components/ui/toast';
import { TaskChat } from '@/components/task/TaskChat';
import { usePermissions } from '@/hooks/use-permissions';

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800', low: 'bg-gray-100 text-gray-700',
};
const statusColor: Record<string, string> = {
  created: 'bg-gray-100 text-gray-600', assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700', submitted: 'bg-indigo-100 text-indigo-700',
  in_review: 'bg-purple-100 text-purple-700', approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700', completed: 'bg-green-100 text-green-700',
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission('create_case') || hasPermission('admin_panel');
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const vi = locale === 'vi';
  const router = (typeof window !== 'undefined') ? { push: (url: string) => window.location.href = url } : null;

  const fetchTask = async () => {
    try {
      const data = await taskApi.get(id);
      setTask(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchTask(); }, [id]);

  const handleTransition = async (action: string) => {
    setActionLoading(true);
    try {
      await taskApi.transition(id, action);
      showToast({ type: 'success', title: vi ? 'Thành công' : 'Success' });
      await fetchTask();
    } catch {
      showToast({ type: 'error', title: vi ? 'Thất bại' : 'Failed' });
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(t('workflow.task.deleteConfirm'))) return;
    setActionLoading(true);
    try {
      await taskApi.delete(id);
      showToast({ type: 'success', title: t('workflow.task.deleteSuccess') });
      router?.push('/tasks');
    } catch {
      showToast({ type: 'error', title: t('workflow.task.deleteFailed') });
    }
    setActionLoading(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!task) return <div className="flex h-64 items-center justify-center text-muted-foreground">{vi ? 'Không tìm thấy nhiệm vụ' : 'Task not found'}</div>;

  const studyUid = task.case?.studyLinks?.[0]?.study?.studyInstanceUid || '';
  const viewerUrl = studyUid ? getViewerUrl({ studyInstanceUid: studyUid, taskId: id, taskType: task.type }) : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tasks"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{task.case?.title || t('workflow.task.type.' + task.type)}</h1>
          <p className="text-sm text-muted-foreground">{t('workflow.task.type.' + task.type)}</p>
        </div>
        <Badge variant="secondary" className={priorityColor[task.priority]}>{task.priority}</Badge>
        <Badge variant="secondary" className={statusColor[task.status]}>{t('workflow.task.status.' + task.status)}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* Left: Task info + actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{vi ? 'Thông tin nhiệm vụ' : 'Task Info'}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{vi ? 'Bệnh nhân' : 'Patient'}:</span>
                <span className="font-medium">{task.case?.patient?.fullName || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{vi ? 'Ca bệnh' : 'Case'}:</span>
                <Link href={`/cases/${task.caseId}`} className="text-primary hover:underline">{task.case?.title || task.caseId}</Link>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{vi ? 'Người thực hiện' : 'Assignee'}:</span>
                <span>{task.assignedTo?.fullName || (vi ? 'Chưa gán' : 'Unassigned')}</span>
              </div>
              {task.slaDeadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SLA:</span>
                  <span>{new Date(task.slaDeadline).toLocaleString(vi ? 'vi-VN' : 'en-US')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {viewerUrl && (
                  <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
                      <ExternalLink className="h-4 w-4" />
                      {t('common.action.openViewer')}
                    </Button>
                  </a>
                )}
                {task.status === 'assigned' && (
                  <Button onClick={() => handleTransition('start')} disabled={actionLoading} className="gap-1.5">
                    <Play className="h-4 w-4" />{vi ? 'Bắt đầu' : 'Start'}
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <Button variant="outline" onClick={() => handleTransition('submit')} disabled={actionLoading} className="gap-1.5">
                    <Send className="h-4 w-4" />{vi ? 'Gửi duyệt' : 'Submit'}
                  </Button>
                )}
                {task.status === 'in_review' && (
                  <>
                    <Button onClick={() => handleTransition('approve')} disabled={actionLoading} className="gap-1.5 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4" />{vi ? 'Duyệt' : 'Approve'}
                    </Button>
                    <Button variant="destructive" onClick={() => handleTransition('reject')} disabled={actionLoading} className="gap-1.5">
                      <XCircle className="h-4 w-4" />{vi ? 'Từ chối' : 'Reject'}
                    </Button>
                  </>
                )}
                {task.status === 'approved' && (
                  <Button onClick={() => handleTransition('complete')} disabled={actionLoading} className="gap-1.5">
                    <CheckCircle className="h-4 w-4" />{vi ? 'Hoàn thành' : 'Complete'}
                  </Button>
                )}

                {canDelete && !['in_progress', 'in_review'].includes(task.status) && (
                  <Button variant="destructive" onClick={handleDelete} disabled={actionLoading} className="gap-1.5">
                    <Trash2 className="h-4 w-4" />{t('workflow.task.delete')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Assignments */}
          {task.assignments && task.assignments.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />{t('workflow.task.assignment.title')}</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y rounded-lg border">
                  {task.assignments.map((a: { id: string; role: string; taskType: string; user?: { id: string; fullName: string } }) => (
                    <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {a.user?.fullName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{a.user?.fullName || '—'}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('workflow.task.assignment.role.' + a.role)} &middot; {t('workflow.task.type.' + a.taskType)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">{t('workflow.task.assignment.role.' + a.role)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Chat */}
        <TaskChat taskId={id} />
      </div>
    </div>
  );
}
