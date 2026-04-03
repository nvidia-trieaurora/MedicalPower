'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, GitBranchPlus, Play, Archive, Pencil, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRESET_TEMPLATES } from '@/lib/workflow-presets';
import { useLocale } from '@/lib/locale-context';
import { useConfirm } from '@/components/ui/confirm-dialog';
import type { WorkflowTemplate } from '@/lib/workflow-types';

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

export default function WorkflowsPage() {
  const { t, locale } = useLocale();
  const { confirm } = useConfirm();
  const vi = locale === 'vi';
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(PRESET_TEMPLATES);

  const handleDuplicate = (template: WorkflowTemplate) => {
    const copy: WorkflowTemplate = {
      ...template,
      id: `copy_${Date.now()}`,
      name: `${template.name} ${t('workflow.manage.copy')}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, copy]);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: vi ? 'Xóa quy trình' : 'Delete Workflow',
      message: vi ? 'Bạn có chắc muốn xóa quy trình này?' : 'Are you sure you want to delete this workflow?',
      confirmLabel: vi ? 'Xóa' : 'Delete',
      cancelLabel: vi ? 'Hủy' : 'Cancel',
      variant: 'destructive',
    });
    if (ok) setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('workflow.manage.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('workflow.manage.count', { count: String(templates.length) })}
          </p>
        </div>
        <Link href="/workflows/builder">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t('workflow.manage.create')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <GitBranchPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">v{template.version}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={statusColor[template.status]}>
                  {t('workflow.status.' + template.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{template.stateMachineDef.nodes.length} {t('workflow.manage.nodes')}</span>
                <span>{template.stateMachineDef.edges.length} {t('workflow.manage.connections')}</span>
              </div>
              <div className="flex items-center gap-1 border-t pt-3">
                <Link href={`/workflows/builder?template=${template.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Pencil className="h-3 w-3" />
                    {t('common.action.edit')}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-3 w-3" />
                  {t('workflow.manage.duplicate')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-destructive hover:text-destructive"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  {t('common.action.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-3 text-center">
            <GitBranchPlus className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('workflow.manage.empty')}</p>
              <p className="text-sm text-muted-foreground">{t('workflow.manage.emptyHint')}</p>
            </div>
            <Link href="/workflows/builder">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {t('workflow.manage.createWorkflow')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
