const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public messageKey?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body?.error?.code || 'UNKNOWN_ERROR',
      body?.error?.message || `Request failed: ${res.statusText}`,
      body?.error?.message_key,
    );
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface SingleResponse<T> {
  data: T;
}

export interface Patient {
  id: string;
  mrn: string;
  fullName: string;
  dob: string;
  gender: string;
  nationalId: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  cases?: Array<{ id: string; title: string; status: string; priority: string }>;
  studies?: Array<{
    id: string;
    studyInstanceUid: string;
    modality: string;
    description: string | null;
    studyDate: string | null;
    numSeries: number;
    numInstances: number;
  }>;
}

export const patientApi = {
  list: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return api.get<PaginatedResponse<Patient>>(`/patients${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => api.get<SingleResponse<Patient>>(`/patients/${id}`),

  create: (data: {
    mrn: string;
    fullName: string;
    dob: string;
    gender: string;
    nationalId?: string;
    phone?: string;
    address?: string;
    organizationId: string;
  }) => api.post<SingleResponse<Patient>>('/patients', data),

  update: (id: string, data: Partial<{
    fullName: string;
    dob: string;
    gender: string;
    nationalId: string;
    phone: string;
    address: string;
  }>) => api.patch<SingleResponse<Patient>>(`/patients/${id}`, data),

  delete: (id: string) => api.delete(`/patients/${id}`),
};

const WORKFLOW_API_BASE = process.env.NEXT_PUBLIC_WORKFLOW_API_URL || 'http://localhost:4006/api/v1';

async function workflowRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${WORKFLOW_API_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body?.error?.code || 'UNKNOWN_ERROR',
      body?.error?.message || `Request failed: ${res.statusText}`,
      body?.error?.message_key,
    );
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const workflowApi = {
  get: <T>(path: string) => workflowRequest<T>(path),
  post: <T>(path: string, body: unknown) => workflowRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => workflowRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => workflowRequest<T>(path, { method: 'DELETE' }),
};

export interface Case {
  id: string;
  title: string;
  description: string | null;
  patientId: string;
  organizationId: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  slaDeadline: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; fullName: string; mrn: string };
  studyLinks?: Array<{
    id: string;
    role: string;
    study: {
      id: string;
      studyInstanceUid: string;
      modality: string;
      description: string | null;
      studyDate: string | null;
      numInstances: number;
    };
  }>;
  tasks?: Array<{
    id: string;
    type: string;
    status: string;
    priority: string;
    assignedTo?: { id: string; fullName: string } | null;
  }>;
  createdBy?: { id: string; fullName: string };
  _count?: { tasks: number };
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  role: string;
  taskType: string;
  user?: { id: string; fullName: string; email: string };
}

export interface TaskAssignmentInput {
  userId: string;
  role: string;
  taskType: string;
}

export interface Task {
  id: string;
  caseId: string;
  type: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  slaDeadline: string | null;
  createdAt: string;
  assignedTo?: { id: string; fullName: string } | null;
  assignments?: TaskAssignment[];
  case?: {
    id: string;
    title: string;
    patient: { id: string; fullName: string; mrn: string };
    studyLinks: Array<{
      study: { studyInstanceUid: string; modality: string };
    }>;
  };
}

export interface DashboardStats {
  totalPatients: number;
  totalCases: number;
  activeTasks: number;
  completedToday: number;
  pendingReview: number;
  slaAtRisk: number;
}

export const caseApi = {
  list: (params?: { search?: string; status?: string; priority?: string; patientId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.patientId) query.set('patientId', params.patientId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return workflowApi.get<PaginatedResponse<Case>>(`/cases${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => workflowApi.get<{ data: Case }>(`/cases/${id}`),
  create: (data: {
    title: string;
    patientId: string;
    organizationId: string;
    priority: string;
    status: string;
    createdById: string;
    description?: string | null;
    assignedTo?: string | null;
    slaDeadline?: string | null;
  }) => workflowApi.post<{ data: Case }>('/cases', data),
  update: (id: string, data: Partial<{
    title: string;
    description: string | null;
    priority: string;
    status: string;
    assignedTo: string | null;
    slaDeadline: string | null;
  }>) => workflowApi.patch<{ data: Case }>(`/cases/${id}`, data),
  delete: (id: string) => workflowApi.delete(`/cases/${id}`),
};

export const taskApi = {
  list: (params?: { status?: string; type?: string; caseId?: string; assignedToId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.caseId) query.set('caseId', params.caseId);
    if (params?.assignedToId) query.set('assignedToId', params.assignedToId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return workflowApi.get<PaginatedResponse<Task>>(`/tasks${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => workflowApi.get<Task>(`/tasks/${id}`),
  create: (data: {
    caseId: string;
    type: string;
    priority?: string;
    assignedToId?: string;
    slaDeadline?: string;
    workflowRunId?: string;
    assignments?: TaskAssignmentInput[];
  }) => workflowApi.post<Task>('/tasks', data),
  transition: (id: string, action: string, userId?: string) =>
    workflowApi.patch<Task>(`/tasks/${id}/transition`, { action, userId }),
  delete: (id: string) => workflowApi.delete<Task>(`/tasks/${id}`),
};

export const dashboardApi = {
  stats: () => workflowApi.get<DashboardStats>('/dashboard/stats'),
};

export interface UserPermissionInfo {
  id: string; email: string; fullName: string; roles: string[];
  defaults: string[]; granted: string[]; effective: string[];
}

export interface Notification {
  id: string; userId: string; type: string; title: string; body: string;
  metadata: Record<string, unknown> | null; readAt: string | null; createdAt: string;
}

export const permissionApi = {
  listUsers: () => workflowApi.get<UserPermissionInfo[]>('/permissions/users'),
  getUserPermissions: (userId: string) => workflowApi.get<{ defaults: string[]; granted: string[]; effective: string[] }>(`/permissions/${userId}`),
  check: (userId: string, permission: string) => workflowApi.get<{ allowed: boolean }>(`/permissions/check/${userId}/${permission}`),
  grant: (userId: string, permission: string, grantedById: string) => workflowApi.post('/permissions/grant', { userId, permission, grantedById }),
  revoke: (userId: string, permission: string) => workflowApi.post('/permissions/revoke', { userId, permission }),
};

export const notificationApi = {
  list: (params: { userId: string; unreadOnly?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams(); query.set('userId', params.userId);
    if (params.unreadOnly) query.set('unreadOnly', 'true');
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return workflowApi.get<PaginatedResponse<Notification>>(`/notifications?${query}`);
  },
  unreadCount: (userId: string) => workflowApi.get<{ unreadCount: number }>(`/notifications/unread-count?userId=${userId}`),
  markAsRead: (id: string) => workflowApi.patch<Notification>(`/notifications/${id}/read`, {}),
  markAllRead: (userId: string) => workflowApi.patch<{ marked: number }>(`/notifications/read-all?userId=${userId}`, {}),
};

export interface WorkflowTemplateSummary {
  id: string;
  name: string;
  description: string | null;
  version: string;
  organizationId?: string;
  stateMachineDef?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const workflowTemplateApi = {
  list: () => workflowApi.get<WorkflowTemplateSummary[]>('/workflow-templates'),
  get: (id: string) => workflowApi.get<WorkflowTemplateSummary>(`/workflow-templates/${id}`),
  create: (data: { name: string; description?: string; stateMachineDef: any; organizationId: string }) =>
    workflowApi.post<WorkflowTemplateSummary>('/workflow-templates', data),
  update: (id: string, data: { name?: string; description?: string; stateMachineDef?: any }) =>
    workflowApi.patch<WorkflowTemplateSummary>(`/workflow-templates/${id}`, data),
  delete: (id: string) => workflowApi.delete(`/workflow-templates/${id}`),
};
