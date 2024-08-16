// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'vitest-canvas-mock';
import failOnConsole from 'vitest-fail-on-console';
import { server } from './mocks/server';

failOnConsole();

vi.setConfig({ testTimeout: 15000 });

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

if (typeof window.URL.createObjectURL === 'undefined') {
  // Required as a work-around for RTL/vitest environment not implementing the window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'testObjectUrl',
  });
}

// Vitest doesn't implement ResizeObserver so mock it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
