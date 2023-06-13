var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

var app = express();

app.get('/operationsgateway-settings.json', function (req, res) {
  // detect if the E2E test is running inside CI
  // If so, use the settings file specific to E2E
  // Otherwise, use the same settings file that is also for running the app normally (yarn start etc).
  const isCiEnv = process.env.CI;
  res.sendFile(path.resolve('./server/e2e-settings.json'));
});

app.use(
  express.json(),
  serveStatic(path.resolve('./build'), { index: ['index.html', 'index.htm'] })
);

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('E2E test server listening at http://localhost:%s', port);
});
