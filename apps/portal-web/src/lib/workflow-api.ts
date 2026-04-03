const WORKFLOW_API_URL = process.env.NEXT_PUBLIC_WORKFLOW_API_URL || 'http://localhost:4006';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${WORKFLOW_API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const workflowApi = {
  templates: {
    list: () => apiFetch<any[]>('/api/v1/workflow-templates'),
    get: (id: string) => apiFetch<any>(`/api/v1/workflow-templates/${id}`),
    create: (data: any) => apiFetch<any>('/api/v1/workflow-templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch<any>(`/api/v1/workflow-templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/api/v1/workflow-templates/${id}`, { method: 'DELETE' }),
  },

  runs: {
    list: (caseId?: string) => apiFetch<any[]>(`/api/v1/workflow-runs${caseId ? `?caseId=${caseId}` : ''}`),
    get: (id: string) => apiFetch<any>(`/api/v1/workflow-runs/${id}`),
    start: (templateId: string, caseId: string) =>
      apiFetch<any>('/api/v1/workflow-runs', { method: 'POST', body: JSON.stringify({ templateId, caseId }) }),
  },

  tasks: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<{ data: any[]; total: number; page: number; limit: number }>(`/api/v1/tasks${query}`);
    },
    get: (id: string) => apiFetch<any>(`/api/v1/tasks/${id}`),
    transition: (id: string, action: string, userId?: string) =>
      apiFetch<any>(`/api/v1/tasks/${id}/transition`, { method: 'PATCH', body: JSON.stringify({ action, userId }) }),
    getActions: (id: string) => apiFetch<{ allowedActions: string[] }>(`/api/v1/tasks/${id}/actions`),
  },
};
