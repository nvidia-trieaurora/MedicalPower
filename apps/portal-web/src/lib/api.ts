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
