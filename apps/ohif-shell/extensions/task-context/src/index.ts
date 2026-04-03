import { Types } from '@ohif/core';

const EXTENSION_ID = '@medicalpower/extension-task-context';

interface TaskContext {
  taskId: string;
  caseId: string;
  patientName?: string;
  priority?: string;
  taskType?: string;
  studyInstanceUid?: string;
}

function parseTaskContextFromUrl(): TaskContext | null {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('taskId');
  const caseId = params.get('caseId');

  if (!taskId || !caseId) return null;

  return {
    taskId,
    caseId,
    patientName: params.get('patientName') || undefined,
    priority: params.get('priority') || undefined,
    taskType: params.get('taskType') || undefined,
    studyInstanceUid: params.get('StudyInstanceUIDs') || undefined,
  };
}

const taskContextExtension: Types.Extensions.Extension = {
  id: EXTENSION_ID,

  preRegistration: ({ servicesManager }) => {
    const context = parseTaskContextFromUrl();
    if (context) {
      console.log(`${EXTENSION_ID}: Task context loaded`, context);
      (window as any).__medicalpower_task_context = context;
    }
  },

  getCommandsModule: ({ servicesManager }) => {
    return {
      definitions: {
        getTaskContext: {
          commandFn: () => (window as any).__medicalpower_task_context || null,
        },
        setTaskContext: {
          commandFn: ({ context }: { context: TaskContext }) => {
            (window as any).__medicalpower_task_context = context;
          },
        },
        clearTaskContext: {
          commandFn: () => {
            delete (window as any).__medicalpower_task_context;
          },
        },
      },
      defaultContext: 'VIEWER',
    };
  },

  getPanelModule: ({ servicesManager }) => {
    return [];
  },
};

export default taskContextExtension;
