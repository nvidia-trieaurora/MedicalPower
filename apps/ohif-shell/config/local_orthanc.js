/** @type {AppTypes.Config} */
window.config = {
  routerBasename: '/',
  showStudyList: true,
  extensions: [],
  modes: [],
  investigationalUseDialog: { option: 'never' },
  showWarningMessageForCrossOrigin: false,
  showCPUFallbackMessage: false,
  showLoadingIndicator: true,
  strictZSpacingForVolumeViewport: true,
  maxNumberOfWebWorkers: 3,
  studyPrefetcher: {
    enabled: true,
    displaySetsCount: 2,
    maxNumPrefetchRequests: 10,
    order: 'closest',
  },

  defaultDataSourceName: 'orthanc',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'orthanc',
      configuration: {
        friendlyName: 'MedicalPower Orthanc',
        name: 'orthanc',
        wadoUriRoot: '/pacs/wado',
        qidoRoot: '/pacs/dicom-web',
        wadoRoot: '/pacs/dicom-web',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        dicomUploadEnabled: true,
        omitQuotationForMultipartRequest: true,
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
      sourceName: 'dicomlocal',
      configuration: {
        friendlyName: 'Local DICOM',
      },
    },
  ],

  medicalpower: {
    apiUrl: 'http://localhost:4000/api/v1',
    monaiLabelUrl: '/monai/',
  },

  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'a',
        {
          target: '_self',
          rel: 'noopener noreferrer',
          className: 'flex items-center gap-2.5',
          href: '/',
          style: { textDecoration: 'none' },
        },
        React.createElement(
          'div',
          {
            style: {
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            },
          },
          React.createElement(
            'svg',
            { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('path', { d: 'M22 12h-4l-3 9L9 3l-3 9H2' })
          )
        ),
        React.createElement(
          'span',
          {
            style: {
              color: '#fafafa', fontWeight: 700, fontSize: '15px',
              letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif',
            },
          },
          'MedicalPower'
        )
      );
    },
  },

  httpErrorHandler: error => {
    console.warn(`HTTP Error Handler (status: ${error.status})`, error);
  },
};
