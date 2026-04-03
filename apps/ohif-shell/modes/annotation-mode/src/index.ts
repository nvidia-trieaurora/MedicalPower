import { hotkeys } from '@ohif/core';

const MODE_ID = '@medicalpower/mode-annotation';

const monailabel = {
  monaiLabel: '@ohif/extension-monai-label.panelModule.monailabel',
};

const ohif = {
  layout: '@ohif/extension-default.layoutTemplateModule.viewerLayout',
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  hangingProtocol: '@ohif/extension-default.hangingProtocolModule.default',
  leftPanel: '@ohif/extension-default.panelModule.seriesList',
};

const cornerstone = {
  viewport: '@ohif/extension-cornerstone.viewportModule.cornerstone',
  panelTool: '@ohif/extension-cornerstone.panelModule.panelSegmentationWithTools',
};

const segmentation = {
  sopClassHandler:
    '@ohif/extension-cornerstone-dicom-seg.sopClassHandlerModule.dicom-seg',
  viewport: '@ohif/extension-cornerstone-dicom-seg.viewportModule.dicom-seg',
};

const extensionDependencies = {
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-seg': '^3.0.0',
  '@ohif/extension-monai-label': '^3.0.0',
};

interface TaskContext {
  taskId: string;
  caseId: string;
  patientName?: string;
  priority?: string;
  taskType?: string;
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
  };
}

function modeFactory({ modeConfiguration }: { modeConfiguration: any }) {
  return {
    id: MODE_ID,
    routeName: 'annotation',
    displayName: 'MedicalPower Annotation',

    onModeEnter: ({
      servicesManager,
      extensionManager,
      commandsManager,
    }: any) => {
      const { measurementService, toolbarService, toolGroupService } =
        servicesManager.services;

      measurementService.clearMeasurements();

      const taskContext = parseTaskContextFromUrl();
      if (taskContext) {
        (window as any).__medicalpower_task_context = taskContext;
      }

      const initToolGroups =
        extensionManager.getModuleEntry &&
        extensionManager.getModuleEntry(
          '@ohif/extension-monai-label.utilityModule.initToolGroups'
        );

      if (!initToolGroups) {
        _initDefaultToolGroups(
          extensionManager,
          toolGroupService,
          commandsManager
        );
      }

      _initToolbar(toolbarService);
    },

    onModeExit: ({ servicesManager }: any) => {
      const {
        toolGroupService,
        syncGroupService,
        segmentationService,
        cornerstoneViewportService,
        uiDialogService,
        uiModalService,
      } = servicesManager.services;

      uiDialogService.dismissAll();
      uiModalService.hide();
      toolGroupService.destroy();
      syncGroupService.destroy();
      segmentationService.destroy();
      cornerstoneViewportService.destroy();

      delete (window as any).__medicalpower_task_context;
    },

    validationTags: {
      study: [],
      series: [],
    },

    isValidMode: ({ modalities }: { modalities: string }) => {
      const modalitiesArray = modalities.split('\\');
      return {
        valid:
          modalitiesArray.includes('CT') || modalitiesArray.includes('MR'),
        description:
          'This mode supports CT and MR modalities for AI-assisted annotation.',
      };
    },

    routes: [
      {
        path: 'annotation',
        layoutTemplate: ({ location, servicesManager }: any) => {
          return {
            id: ohif.layout,
            props: {
              rightPanelDefaultClosed: false,
              leftPanels: [ohif.leftPanel],
              rightPanels: [monailabel.monaiLabel],
              viewports: [
                {
                  namespace: cornerstone.viewport,
                  displaySetsToDisplay: [ohif.sopClassHandler],
                },
                {
                  namespace: segmentation.viewport,
                  displaySetsToDisplay: [segmentation.sopClassHandler],
                },
              ],
            },
          };
        },
      },
    ],

    extensions: extensionDependencies,
    hangingProtocol: 'mpr',
    sopClassHandlers: [ohif.sopClassHandler, segmentation.sopClassHandler],
    hotkeys: [...hotkeys.defaults.hotkeyBindings],
  };
}

function _initToolbar(toolbarService: any) {
  toolbarService.createButtonSection('primary', [
    'WindowLevel',
    'Pan',
    'Zoom',
    'TrackballRotate',
    'Capture',
    'Layout',
    'MPR',
    'Crosshairs',
    'MoreTools',
  ]);
  toolbarService.createButtonSection('segmentationToolbox', [
    'BrushTools',
    'Shapes',
  ]);
}

function _initDefaultToolGroups(
  extensionManager: any,
  toolGroupService: any,
  commandsManager: any
) {
  const utilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone.utilityModule.tools'
  );

  if (!utilityModule) return;

  const { toolNames, Enums } = utilityModule.exports;

  const defaultTools = {
    active: [
      {
        toolName: toolNames.WindowLevel,
        bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
      },
      {
        toolName: toolNames.Pan,
        bindings: [{ mouseButton: Enums.MouseBindings.Auxiliary }],
      },
      {
        toolName: toolNames.Zoom,
        bindings: [{ mouseButton: Enums.MouseBindings.Secondary }],
      },
      {
        toolName: toolNames.StackScroll,
        bindings: [{ mouseButton: Enums.MouseBindings.Wheel }],
      },
    ],
    passive: [
      {
        toolName: 'CircularBrush',
        parentTool: 'Brush',
        configuration: { activeStrategy: 'FILL_INSIDE_CIRCLE' },
      },
      {
        toolName: 'CircularEraser',
        parentTool: 'Brush',
        configuration: { activeStrategy: 'ERASE_INSIDE_CIRCLE' },
      },
      {
        toolName: 'SphereBrush',
        parentTool: 'Brush',
        configuration: { activeStrategy: 'FILL_INSIDE_SPHERE' },
      },
      {
        toolName: 'SphereEraser',
        parentTool: 'Brush',
        configuration: { activeStrategy: 'ERASE_INSIDE_SPHERE' },
      },
      {
        toolName: 'ThresholdCircularBrush',
        parentTool: 'Brush',
        configuration: { activeStrategy: 'THRESHOLD_INSIDE_CIRCLE' },
      },
      { toolName: toolNames.CircleScissors },
      { toolName: toolNames.RectangleScissors },
      { toolName: toolNames.SphereScissors },
      { toolName: toolNames.StackScroll },
      { toolName: toolNames.Magnify },
      { toolName: 'ProbeMONAILabel' },
    ],
    disabled: [
      { toolName: toolNames.ReferenceLines },
      { toolName: toolNames.AdvancedMagnify },
    ],
  };

  toolGroupService.createToolGroupAndAddTools('default', defaultTools);
  toolGroupService.createToolGroupAndAddTools('mpr', {
    ...defaultTools,
    disabled: [
      ...defaultTools.disabled,
      { toolName: toolNames.Crosshairs, configuration: { viewportIndicators: true } },
    ],
  });
}

const mode = {
  id: MODE_ID,
  modeFactory,
  extensionDependencies,
};

export default mode;
