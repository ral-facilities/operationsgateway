// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { Action, PreloadedState, ThunkAction } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import {
  Channel,
  FullChannelMetadata,
  ImageChannel,
  Record,
  RecordRow,
  ScalarChannel,
  WaveformChannel,
} from './app.types';
import { AppStore, RootState, setupStore } from './state/store';
import { initialState as initialConfigState } from './state/slices/configSlice';
import { initialState as initialTableState } from './state/slices/tableSlice';
import { initialState as initialSearchState } from './state/slices/searchSlice';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient } from 'react-query';

export let actions: Action[] = [];
export let resetActions = (): void => {
  actions = [];
};
export const getInitialState = (): RootState => ({
  config: initialConfigState,
  table: initialTableState,
  search: initialSearchState,
});
export const dispatch = (
  action: Action | ThunkAction<void, RootState, unknown, Action<string>>
): void | Promise<void> => {
  if (typeof action === 'function') {
    action(dispatch, getInitialState, null);
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

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export const hooksWrapperWithProviders = (state = {}): any => {
  const testQueryClient = createTestQueryClient();
  const store = setupStore(state);
  const wrapper = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
  return wrapper;
};

export function renderComponentWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const testQueryClient = createTestQueryClient();
  function Wrapper({ children }: React.PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export function renderComponentWithStore(
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
    channel_dtype: 'image',
    userFriendlyName: 'Test 1',
  },
  {
    systemName: 'test_2',
    channel_dtype: 'waveform',
  },
  {
    systemName: 'test_3',
    channel_dtype: 'scalar',
    significantFigures: 2,
    scientificNotation: true,
  },
];

export const generateRecord = (num: number): Record => {
  const numStr = `${num}`;

  let channel: Channel;

  if (num % 3 === 0) {
    channel = {
      metadata: {
        channel_dtype: 'scalar',
        units: 'km',
      },
      data:
        num < 10
          ? parseFloat(`${num}${num}${num}.${num}`)
          : parseFloat(
              numStr[0] + numStr[1] + numStr[1] + numStr[1] + '.' + numStr[1]
            ),
    } as ScalarChannel;
  } else if (num % 3 === 1) {
    channel = {
      metadata: {
        channel_dtype: 'image',
        horizontalPixels: num,
        horizontalPixelUnits: numStr,
        verticalPixels: num,
        verticalPixelUnits: numStr,
        cameraGain: num,
        exposureTime: num,
      },
      imagePath: numStr,
      thumbnail: numStr,
    } as ImageChannel;
  } else {
    channel = {
      metadata: {
        channel_dtype: 'waveform',
        xUnits: numStr,
        yUnits: numStr,
      },
      waveformId: numStr,
      thumbnail: numStr,
    } as WaveformChannel;
  }

  return {
    id: numStr,
    metadata: {
      dataVersion: numStr,
      shotnum: num,
      timestamp:
        num < 10 ? `2022-01-0${num} 00:00:00` : `2022-01-${num} 00:00:00`,
      activeArea: numStr,
      activeExperiment: numStr,
    },
    channels: {
      [`test_${num}`]: channel,
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
    shotnum: record.metadata.shotnum,
    activeArea: record.metadata.activeArea,
    activeExperiment: record.metadata.activeExperiment,
  };

  const keys = Object.keys(record.channels);
  keys.forEach((key: string) => {
    const channel: Channel = record.channels[key];
    let channelData;
    const channelDataType = channel.metadata.channel_dtype;

    switch (channelDataType) {
      case 'scalar':
        channelData = (channel as ScalarChannel).data;
        break;
      case 'image':
        channelData = (channel as ImageChannel).thumbnail;
        channelData = `<img src="data:image/jpeg;base64,${channelData}" alt="${key}" />`;
        break;
      case 'waveform':
        channelData = (channel as WaveformChannel).thumbnail;
        channelData = `<img src="data:image/jpeg;base64,${channelData}" alt="${key}" />`;
    }

    recordRow[key] = channelData;
  });

  return recordRow;
};

export const testRecordRows = Array.from(Array(3), (_, i) =>
  generateRecordRow(i + 1)
);
