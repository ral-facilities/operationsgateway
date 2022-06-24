// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { Record } from './app.types';

export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

// MUI date pickers default to mobile versions during testing and so functions
// like .simulate('change') will not work, this workaround ensures desktop
// datepickers are used in tests instead
// https://github.com/mui/material-ui-pickers/issues/2073
export const applyDatePickerWorkaround = (): void => {
  // add window.matchMedia
  // this is necessary for the date picker to be rendered in desktop mode.
  // if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      media: query,
      // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
      matches: query === '(pointer: fine)',
      onchange: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

export const cleanupDatePickerWorkaround = (): void => {
  delete window.matchMedia;
};

export const testRecords: Record[] = [
  {
    id: '1',
    metadata: {
      dataVersion: '1',
      shotNum: 1,
      timestamp: '1',
      activeArea: '1',
      activeExperiment: '1',
    },
    channels: {
      test1: {
        metadata: {
          dataType: {
            units: 'km',
          },
        },
        data: 1,
      },
    },
  },
  {
    id: '2',
    metadata: {
      dataVersion: '1',
      shotNum: 2,
      timestamp: '2',
      activeArea: '2',
      activeExperiment: '2',
    },
    channels: {
      test2: {
        metadata: {
          dataType: {
            units: 'km',
          },
        },
        data: 2,
      },
    },
  },
  {
    id: '3',
    metadata: {
      dataVersion: '3',
      shotNum: 3,
      timestamp: '3',
      activeArea: '3',
      activeExperiment: '3',
    },
    channels: {
      test3: {
        metadata: {
          dataType: {
            units: 'km',
          },
        },
        data: 3,
      },
    },
  },
];
