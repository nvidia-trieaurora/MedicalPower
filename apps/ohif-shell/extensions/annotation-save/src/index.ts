import { Types } from '@ohif/core';

const EXTENSION_ID = '@medicalpower/extension-annotation-save';

const annotationSaveExtension: Types.Extensions.Extension = {
  id: EXTENSION_ID,

  preRegistration: ({ servicesManager, configuration = {} }) => {
    console.log(`${EXTENSION_ID} registered`);
  },

  getCommandsModule: ({ servicesManager }) => {
    return {
      definitions: {
        saveAnnotationToService: {
          commandFn: async ({
            annotationData,
            sessionId,
          }: {
            annotationData: unknown;
            sessionId: string;
          }) => {
            const { uiNotificationService } = servicesManager.services;
            const apiUrl =
              (window as any).config?.medicalpower?.apiUrl || '/api/v1';
            const taskContext =
              (window as any).__medicalpower_task_context || {};

            try {
              const response = await fetch(
                `${apiUrl}/annotation-sessions/${sessionId || taskContext.taskId}/artifacts`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...taskContext,
                    data: annotationData,
                    savedAt: new Date().toISOString(),
                  }),
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }

              const result = await response.json();

              uiNotificationService?.show?.({
                title: 'Annotation Saved',
                message: 'Annotation saved successfully.',
                type: 'success',
                duration: 3000,
              });

              return result;
            } catch (error: any) {
              uiNotificationService?.show?.({
                title: 'Save Failed',
                message: error.message || 'Failed to save annotation',
                type: 'error',
                duration: 5000,
              });
              throw error;
            }
          },
        },

        getTaskContext: {
          commandFn: () => {
            return (window as any).__medicalpower_task_context || null;
          },
        },
      },
      defaultContext: 'VIEWER',
    };
  },

  getPanelModule: () => {
    return [];
  },
};

export default annotationSaveExtension;
