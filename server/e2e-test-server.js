var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

var app = express();

app.get('/operationsgateway-settings.json', function (req, res) {
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
