import {
  setupWorker,
  rest,
  matchRequestUrl,
  createResponseComposition,
} from 'msw';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Make the `worker` and `rest` references available globally,
// so they can be accessed in both runtime and test suites.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.msw = {
  worker,
  rest,
  matchRequestUrl,
  createResponseComposition,
};
