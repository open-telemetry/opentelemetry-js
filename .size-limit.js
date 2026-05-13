module.exports = [
  {
    name: '@opentelemetry/api',
    path: 'api/build/esm/index.js',
    import: '{ trace, metrics, context, propagation }',
    gzip: true,
  },
  {
    name: '@opentelemetry/api (full)',
    path: 'api/build/esm/index.js',
    import: '*',
    gzip: true,
  },
  {
    name: '@opentelemetry/core',
    path: 'packages/opentelemetry-core/build/esm/index.js',
    import: '{ hrTime, hrTimeDuration, ExportResultCode }',
    gzip: true,
  },
  {
    name: '@opentelemetry/core (full)',
    path: 'packages/opentelemetry-core/build/esm/index.js',
    import: '*',
    gzip: true,
  },
  {
    name: '@opentelemetry/semantic-conventions',
    path: 'semantic-conventions/build/esm/index.js',
    import: '{ ATTR_HTTP_REQUEST_METHOD, ATTR_URL_PATH, ATTR_HTTP_RESPONSE_STATUS_CODE }',
    gzip: true,
  },
  {
    name: '@opentelemetry/semantic-conventions (full)',
    path: 'semantic-conventions/build/esm/index.js',
    import: '*',
    gzip: true,
  },
];
