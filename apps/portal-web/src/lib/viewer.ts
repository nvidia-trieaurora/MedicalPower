const OHIF_BASE_URL =
  process.env.NEXT_PUBLIC_OHIF_URL || 'http://localhost:3001';

type ViewerMode = 'viewer' | 'monai-label';

export function getViewerUrl(params: {
  studyInstanceUid: string;
  mode?: ViewerMode;
  taskId?: string;
  caseId?: string;
  patientName?: string;
  taskType?: string;
  priority?: string;
}): string {
  const { mode = 'viewer', studyInstanceUid, ...rest } = params;
  const searchParams = new URLSearchParams();
  searchParams.set('StudyInstanceUIDs', studyInstanceUid);

  for (const [key, value] of Object.entries(rest)) {
    if (value) searchParams.set(key, value);
  }

  return `${OHIF_BASE_URL}/${mode}?${searchParams.toString()}`;
}

export function getOrthancExplorerUrl(): string {
  return process.env.NEXT_PUBLIC_ORTHANC_URL || 'http://localhost:8042';
}
