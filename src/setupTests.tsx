// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// need to mock <canvas> for plotting
import 'jest-canvas-mock';
import {
  FullChannelMetadata,
  PlotDataset,
  timeChannelName,
  FullScalarChannelMetadata,
  DEFAULT_WINDOW_VARS,
} from './app.types';
import { Action, PreloadedState, ThunkAction } from '@reduxjs/toolkit';
import { AppStore, RootState, setupStore } from './state/store';
import { initialState as initialConfigState } from './state/slices/configSlice';
import { initialState as initialTableState } from './state/slices/tableSlice';
import { initialState as initialSearchState } from './state/slices/searchSlice';
import {
  initialState as initialPlotState,
  PlotConfig,
} from './state/slices/plotSlice';
import { initialState as initialFilterState } from './state/slices/filterSlice';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { COLOUR_ORDER } from './plotting/plotSettings/colourGenerator';
import { staticChannels } from './api/channels';
import { server } from './mocks/server';
import { matchRequestUrl, MockedRequest } from 'msw';
import channelsJson from './mocks/channels.json';

jest.setTimeout(15000);

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

/**
 * Waits for msw request -
 * @param method string representing the HTTP method
 * @param url string representing the URL match for the route
 * @returns a promise of the matching request
 *  */
export function waitForRequest(method: string, url: string) {
  let requestId = '';

  return new Promise<MockedRequest>((resolve, reject) => {
    server.events.on('request:start', (req) => {
      const matchesMethod = req.method.toLowerCase() === method.toLowerCase();

      const matchesUrl = matchRequestUrl(req.url, url).matches;

      if (matchesMethod && matchesUrl) {
        requestId = req.id;
      }
    });

    server.events.on('request:match', (req) => {
      if (req.id === requestId) {
        resolve(req);
      }
    });

    server.events.on('request:unhandled', (req) => {
      if (req.id === requestId) {
        reject(
          new Error(`The ${req.method} ${req.url.href} request was unhandled.`)
        );
      }
    });
  });
}

// this is needed because of https://github.com/facebook/jest/issues/8987
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let mockActualReact;
jest.doMock('react', () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!mockActualReact) {
    mockActualReact = jest.requireActual('react');
  }
  return mockActualReact;
});

export let actions: Action[] = [];
export const resetActions = (): void => {
  actions = [];
};
export const getInitialState = (): RootState => ({
  config: initialConfigState,
  table: initialTableState,
  search: initialSearchState,
  plots: initialPlotState,
  filter: initialFilterState,
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

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
  queryClient?: QueryClient;
}

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 300000,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: jest.fn(),
    },
  });

export const hooksWrapperWithProviders = (
  state = {},
  queryClient?: QueryClient
) => {
  const testQueryClient = queryClient ?? createTestQueryClient();
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
    // Automatically create a query client instance if no query client was passed in
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }
  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
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
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
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
      onchange: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
};

export const cleanupDatePickerWorkaround = (): void => {
  delete window.matchMedia;
};

export const testChannels = [
  ...Object.values(staticChannels),
  ...Object.entries(channelsJson.channels).map(
    ([systemName, channel]) =>
      ({
        systemName,
        ...channel,
      } as FullChannelMetadata)
  ),
];

export const testScalarChannels: FullScalarChannelMetadata[] = [
  ...Object.values(staticChannels),
  ...Object.entries(channelsJson.channels)
    .filter(([systemName, channel]) => channel.type === 'scalar')
    .map(
      ([systemName, channel]) =>
        ({
          systemName,
          ...channel,
        } as FullScalarChannelMetadata)
    ),
];

export const generatePlotDataset = (num: number) => {
  const datasetName = testScalarChannels[num].systemName;
  const plotDataset: PlotDataset = {
    name: datasetName,
    data: [
      {
        timestamp: num,
        [datasetName]: num + num,
      },
      {
        timestamp: num + num,
        [datasetName]: num + num + num,
      },
      {
        timestamp: num + num + num,
        [datasetName]: num + num + num + num,
      },
    ],
  };
  return plotDataset;
};

export const testPlotDatasets = Array.from(Array(3), (_, i) =>
  generatePlotDataset(i + 1)
);

export const generatePlotConfig = (num: number) => {
  const plotTitle = `Plot ${num}`;

  const plotConfig: PlotConfig = {
    open: num % 2 === 0,
    title: plotTitle,
    plotType: num % 2 === 0 ? 'scatter' : 'line',
    XAxis: num % 3 === 0 ? timeChannelName : undefined,
    XAxisScale:
      num % 3 === 0 ? 'time' : num % 3 === 1 ? 'linear' : 'logarithmic',
    selectedPlotChannels: [],
    leftYAxisScale: num % 2 === 0 ? 'linear' : 'logarithmic',
    rightYAxisScale: num % 2 === 0 ? 'logarithmic' : 'linear',
    gridVisible: num % 2 === 0,
    axesLabelsVisible: num % 2 !== 0,
    selectedColours: [],
    remainingColours: COLOUR_ORDER.map((colour) => colour),
    ...DEFAULT_WINDOW_VARS,
  };

  return plotConfig;
};

export const testPlotConfigs = Array.from(Array(3), (_, i) =>
  generatePlotConfig(i)
);
