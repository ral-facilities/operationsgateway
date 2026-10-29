// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder } from 'util';
import { network } from 'virtual:msw';
import failOnConsole from 'vitest-fail-on-console';
import { handlers } from './mocks/handlers';
import { serverHandlers } from './mocks/serverHandlers';

// need this until https://github.com/testing-library/react-testing-library/issues/1197 is fixed
Object.assign(globalThis, { jest: vi });

globalThis.TextEncoder = TextEncoder;

failOnConsole();

vi.setConfig({ testTimeout: 15000 });

network.configure({
  handlers: [...handlers, ...serverHandlers],
  context: {
    quiet: true,
  },
});

// Establish API mocking before all tests.
beforeAll(async () => {
  await network.enable();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => network.resetHandlers());

// Clean up after the tests are finished.
afterAll(async () => {
  await network.disable();
});

// Vitest doesn't implement ResizeObserver so mock it
globalThis.ResizeObserver = vi.fn(
  class {
    constructor() {}
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);
