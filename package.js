Package.describe({
  name: 'dispatch:retry-http',
  version: '0.0.1',
  summary: 'Wrap http with retry logic.',
  git: 'https://github.com/DispatchMe/meteor-retry-http.git'
});

Package.onUse(function (api) {
  api.versionsFrom('1.0');

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
