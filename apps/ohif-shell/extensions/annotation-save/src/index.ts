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
          commandFn: async ({ annotationData, sessionId }: { annotationData: unknown; sessionId: string }) => {
            const apiUrl = window.config?.medicalpower?.apiUrl || '/api/v1';
            const response = await fetch(`${apiUrl}/sessions/${sessionId}/artifacts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(annotationData),
            });
            if (!response.ok) {
              throw new Error(`Failed to save annotation: ${response.statusText}`);
            }
            return response.json();
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
