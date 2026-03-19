const MODE_ID = '@medicalpower/mode-annotation';

const annotationMode = {
  id: MODE_ID,
  routeName: 'annotation',
  displayName: 'MedicalPower Annotation',

  onModeEnter: ({ servicesManager }: { servicesManager: any }) => {
    console.log(`Entering ${MODE_ID}`);
  },

  onModeExit: ({ servicesManager }: { servicesManager: any }) => {
    console.log(`Exiting ${MODE_ID}`);
  },

  validationTags: {
    study: [],
    series: [],
  },

  isValidMode: ({ modalities }: { modalities: string[] }) => {
    return { valid: true };
  },

  routes: [
    {
      path: 'annotation',
      layoutTemplate: ({ location, servicesManager }: any) => {
        return {
          id: MODE_ID,
          props: {
            leftPanels: ['@ohif/extension-monai-label.panelModule.monaiLabel'],
            rightPanels: ['@ohif/extension-measurement-tracking.panelModule.trackedMeasurements'],
            viewports: [
              {
                namespace: '@ohif/extension-cornerstone.viewportModule.cornerstone',
                displaySetsToDisplay: ['@ohif/extension-default.sopClassHandlerModule.stack'],
              },
            ],
          },
        };
      },
    },
  ],
};

export default annotationMode;
