const OHIF_BASE_URL = process.env.NEXT_PUBLIC_OHIF_URL || 'http://localhost:8042';

export function getViewerUrl(params: {
  studyInstanceUid: string;
  taskId?: string;
  caseId?: string;
  patientName?: string;
  taskType?: string;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set('StudyInstanceUIDs', params.studyInstanceUid);
  if (params.taskId) searchParams.set('taskId', params.taskId);
  if (params.caseId) searchParams.set('caseId', params.caseId);
  if (params.patientName) searchParams.set('patientName', params.patientName);
  if (params.taskType) searchParams.set('taskType', params.taskType);

  return `${OHIF_BASE_URL}/ohif/viewer?${searchParams.toString()}`;
}

export function getOrthancExplorerUrl(): string {
  return process.env.NEXT_PUBLIC_ORTHANC_URL || 'http://localhost:8042';
}
