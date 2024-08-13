// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import crypto from 'crypto';
// TODO JOEL: Is this still needed? - Also in vite config
// need to mock <canvas> for plotting
import 'vitest-canvas-mock';
// TODO JOEL: Replace with vitest-fail-on-console
import failOnConsole from 'jest-fail-on-console';
import { TextEncoder } from 'util';
import { server } from './mocks/server';

// TODO JOEL: Is this still needed? - same for failOnConsole below
global.TextEncoder = TextEncoder;

failOnConsole();

vi.setConfig({ testTimeout: 15000 });

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// TODO JOEL: Check if a all of the below is still needed

if (typeof window.URL.createObjectURL === 'undefined') {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'testObjectUrl',
  });
}

if (typeof window.URL.revokeObjectURL === 'undefined') {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: () => {},
  });
}

// this is needed because of https://github.com/facebook/jest/issues/8987
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let mockActualReact;
vi.doMock('react', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!mockActualReact) {
    mockActualReact = await vi.importActual('react');
  }
  return mockActualReact;
});

if (typeof window.URL.createObjectURL === 'undefined') {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'testObjectUrl',
  });
}

if (typeof window.URL.revokeObjectURL === 'undefined') {
  // required as work-around for enzyme/jest environment not implementing window.URL.revokeObjectURL method
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: () => {
      // no-op
    },
  });
}

// jest doesn't implement web crypto so set up nodejs crypto as a default
Object.defineProperty(global, 'crypto', {
  value: Object.setPrototypeOf({ subtle: crypto.subtle }, crypto),
});
