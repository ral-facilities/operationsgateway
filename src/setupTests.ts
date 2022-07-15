// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { FullChannelMetadata, Record } from './app.types';

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

export const testChannels: FullChannelMetadata[] = [
  {
    systemName: 'test1',
    dataType: 'scalar',
    userFriendlyName: 'Test 1',
    sf: 4,
  },
  {
    systemName: 'test2',
    dataType: 'scalar',
    sf: 2,
    scientificNotation: false,
  },
  {
    systemName: 'test3',
    dataType: 'scalar',
    sf: 2,
    scientificNotation: true,
  },
];

export const generateRecord = (num: number): Record => {
  const numStr = `${num}`;
  return {
    id: numStr,
    metadata: {
      dataVersion: numStr,
      shotNum: num,
      timestamp: numStr,
      activeArea: numStr,
      activeExperiment: numStr,
    },
    channels: {
      [`test${num}`]: {
        metadata: {
          dataType: 'scalar',
          units: 'km',
        },
        data:
          num < 10
            ? parseFloat(`${num}${num}${num}.${num}`)
            : parseFloat(
                numStr[0] + numStr[1] + numStr[1] + numStr[1] + '.' + numStr[1]
              ),
      },
    },
  };
};

export const testRecords: Record[] = Array.from(Array(3), (_, i) =>
  generateRecord(i + 1)
);
