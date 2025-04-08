import express from 'express';
import path from 'path';

const app = express();

app.get('/operationsgateway-settings.json', function (_req, res) {
  // detect if the E2E test is running inside CI
  // If so, use the settings file specific to E2E
  // Otherwise, use the same settings file that is also for running the app normally (yarn start etc).
  const isCiEnv = process.env.CI;
  const isRealE2ETesting = process.env.USE_REAL_API === 'true';
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
  express.static(path.resolve('./dist'), { index: ['index.html', 'index.htm'] })
);

app.get('/{*splat}', function (_req, res) {
  res.sendFile(path.resolve('./dist/index.html'));
});

const server = app.listen(3000, '0.0.0.0', function () {
  const port = server.address().port;
  console.log('E2E test server listening at http://localhost:%s', port);
});
