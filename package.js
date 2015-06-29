Package.describe({
  name: 'dispatch:retry-http',
  version: '0.0.1',
  summary: 'Wrap http with retry logic.'
});

Package.onUse(function (api) {
  api.use([
    'retry',
    'http'
  ]);

  api.addFiles('retry_http.js');

  api.export('RetryHttp');
});

Package.onTest(function (api) {
  api.use([
    'http',
    'tinytest',
    'dispatch:retry-http'
  ]);

  api.addFiles('retry_http.test.js');
});
