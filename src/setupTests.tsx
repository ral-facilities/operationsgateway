// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { Action, PreloadedState, ThunkAction } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { Channel, FullChannelMetadata, Record, RecordRow } from './app.types';
import { AppStore, RootState, setupStore } from './state/store';
import { initialState as initialConfigState } from './state/slices/configSlice';
import { initialState as initialColumnsState } from './state/slices/columnsSlice';
import { initialState as initialSearchState } from './state/slices/searchSlice';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

export let actions: Action[] = [];
export let resetActions = (): void => {
  actions = [];
};
export const getState = (): RootState => ({
  config: initialConfigState,
  columns: initialColumnsState,
  search: initialSearchState,
});
export const dispatch = (
  action: Action | ThunkAction<void, RootState, unknown, Action<string>>
): void | Promise<void> => {
  if (typeof action === 'function') {
    action(dispatch, getState, null);
    return Promise.resolve();
  } else {
    actions.push(action);
  }
};

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: React.PropsWithChildren<{}>): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

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
    systemName: 'test_1',
    dataType: 'scalar',
    userFriendlyName: 'Test 1',
    significantFigures: 4,
  },
  {
    systemName: 'test_2',
    dataType: 'scalar',
    significantFigures: 2,
    scientificNotation: false,
  },
  {
    systemName: 'test_3',
    dataType: 'scalar',
    significantFigures: 2,
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
      [`test_${num}`]: {
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

export const generateRecordRow = (num: number) => {
  const record = generateRecord(num);

  let recordRow: RecordRow = {
    timestamp: record.metadata.timestamp,
    shotNum: record.metadata.shotNum,
    activeArea: record.metadata.activeArea,
    activeExperiment: record.metadata.activeExperiment,
  };

  const keys = Object.keys(record.channels);
  keys.forEach((key: string) => {
    const channel: Channel = record.channels[key];
    const channelData = channel.data;
    recordRow[key] = channelData;
  });

  return recordRow;
};

export const testRecordRows = Array.from(Array(3), (_, i) =>
  generateRecordRow(i + 1)
);
