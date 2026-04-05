'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, GitBranchPlus, Pencil, Copy, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { workflowTemplateApi, type WorkflowTemplateSummary } from '@/lib/api';
import { PRESET_TEMPLATES } from '@/lib/workflow-presets';
import { useLocale } from '@/lib/locale-context';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

export default function WorkflowsPage() {
  const { t, locale } = useLocale();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const router = useRouter();
  const vi = locale === 'vi';
  const [templates, setTemplates] = useState<WorkflowTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await workflowTemplateApi.list();
      setTemplates(data);
    } catch {
      setTemplates(PRESET_TEMPLATES.map((p) => ({
        id: p.id, name: p.name, description: p.description,
        version: String(p.version), stateMachineDef: p.stateMachineDef,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleDuplicate = async (tpl: WorkflowTemplateSummary) => {
    try {
      await workflowTemplateApi.create({
        name: `${tpl.name} (copy)`,
        description: tpl.description || '',
        stateMachineDef: tpl.stateMachineDef,
        organizationId: 'org_001',
      });
      showToast({ type: 'success', title: vi ? 'Đã nhân bản' : 'Duplicated' });
      fetchTemplates();
    } catch {
      showToast({ type: 'error', title: vi ? 'Lỗi' : 'Failed' });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: vi ? 'Xóa quy trình' : 'Delete Workflow',
      message: vi ? 'Bạn có chắc muốn xóa quy trình này?' : 'Delete this workflow?',
      confirmLabel: vi ? 'Xóa' : 'Delete', cancelLabel: vi ? 'Hủy' : 'Cancel',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      await workflowTemplateApi.delete(id);
      showToast({ type: 'success', title: vi ? 'Đã xóa' : 'Deleted' });
      fetchTemplates();
    } catch {
      showToast({ type: 'error', title: vi ? 'Lỗi xóa' : 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('workflow.manage.title')}</h1>
          <p className="text-sm text-muted-foreground">{templates.length} {vi ? 'quy trình' : 'workflows'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTemplates} disabled={loading}>
            <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/workflows/builder">
            <Button className="gap-1.5"><Plus className="h-4 w-4" />{t('workflow.manage.create')}</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => router.push(`/workflows/${tpl.id}`)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <GitBranchPlus className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">{vi ? 'Hoạt động' : 'Active'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{tpl.description}</p>
                {tpl.stateMachineDef && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{tpl.stateMachineDef.nodes?.length || 0} nodes</span>
                    <span>{tpl.stateMachineDef.edges?.length || 0} {vi ? 'kết nối' : 'connections'}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 border-t pt-3" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/workflows/builder?template=${tpl.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs"><Pencil className="h-3 w-3" />{t('common.action.edit')}</Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleDuplicate(tpl)}>
                    <Copy className="h-3 w-3" />{t('workflow.manage.duplicate')}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(tpl.id)}>
                    <Trash2 className="h-3 w-3" />{t('common.action.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-3 text-center">
            <GitBranchPlus className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{vi ? 'Chưa có quy trình nào' : 'No workflows yet'}</p>
            <Link href="/workflows/builder"><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />{t('workflow.manage.create')}</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
