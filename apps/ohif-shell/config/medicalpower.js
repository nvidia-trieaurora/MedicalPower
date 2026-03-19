window.config = {
  routerBasename: '/ohif/',
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  strictZSpacingForVolumeViewport: true,

  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'orthanc',
      configuration: {
        friendlyName: 'MedicalPower Orthanc',
        name: 'orthanc',
        wadoUriRoot: '/dicom-web/wado',
        qidoRoot: '/dicom-web',
        wadoRoot: '/dicom-web',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        dicomUploadEnabled: true,
        bulkDataURI: {
          enabled: true,
        },
      },
    },
  ],

  defaultDataSourceName: 'orthanc',

  oidc: [
    {
      authority: 'http://localhost:8080/realms/medicalpower',
      client_id: 'ohif-viewer',
      redirect_uri: '/ohif/callback',
      response_type: 'code',
      scope: 'openid profile email',
      post_logout_redirect_uri: '/ohif/',
      automaticSilentRenew: true,
      revokeAccessTokenOnSignout: true,
    },
  ],

  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'a',
        {
          target: '_self',
          rel: 'noopener noreferrer',
          className: 'text-purple-600 line-through',
          href: '/',
        },
        React.createElement(
          'span',
          { style: { color: '#fff', fontWeight: 'bold', fontSize: '16px' } },
          'MedicalPower'
        )
      );
    },
  },
};
