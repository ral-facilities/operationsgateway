import { http, matchRequestUrl } from 'msw';
import { handlers } from './handlers';
import { browserHandlers } from './browserHandlers';
import { setupWorker } from 'msw/browser';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers, ...browserHandlers);

// Make the `worker` and `http` references available globally,
// so they can be accessed in both runtime and test suites.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.msw = {
  worker,
  http,
  matchRequestUrl,
};
