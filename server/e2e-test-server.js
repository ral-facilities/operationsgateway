var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

var app = express();

app.get('/operationsgateway-settings.json', function (req, res) {
  // detect if the E2E test is running inside CI
  // If so, use the settings file specific to E2E
  // Otherwise, use the same settings file that is also for running the app normally (yarn start etc).
  const isCiEnv = process.env.CI;
  const isRealE2ETesting = process.env.USE_REAL_API;
  res.sendFile(
    path.resolve(
      isRealE2ETesting
        ? isCiEnv
          ? './server/e2e-settings-real.json'
          : './public/operationsgateway-settings.json'
        : './server/e2e-settings-mocked.json'
    )
  );
});

app.use(
  express.json(),
  serveStatic(path.resolve('./build'), { index: ['index.html', 'index.htm'] })
);

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

var server = app.listen(3000, '0.0.0.0', function () {
  var port = server.address().port;
  console.log('E2E test server listening at http://localhost:%s', port);
});
