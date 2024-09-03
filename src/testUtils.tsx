import { Action, ThunkAction } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { matchRequestUrl } from 'msw';
import React from 'react';
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// need to mock <canvas> for plotting
import 'jest-canvas-mock';
import { Provider } from 'react-redux';
import { staticChannels } from './api/channels';
import {
  DEFAULT_WINDOW_VARS,
  FullChannelMetadata,
  FullScalarChannelMetadata,
  PlotDataset,
  timeChannelName,
} from './app.types';
import channelsJson from './mocks/channels.json';
import { server } from './mocks/server';
import { COLOUR_ORDER } from './plotting/plotSettings/colourGenerator';
import { initialState as initialConfigState } from './state/slices/configSlice';
import { initialState as initialFilterState } from './state/slices/filterSlice';
import { initialState as initialFunctionsState } from './state/slices/functionsSlice';
import {
  PlotConfig,
  initialState as initialPlotState,
} from './state/slices/plotSlice';
import { initialStateFunc as initialSearchStateFunc } from './state/slices/searchSlice';
import { initialState as initialSelectionState } from './state/slices/selectionSlice';
import { initialState as initialTableState } from './state/slices/tableSlice';
import { initialState as initialWindowsState } from './state/slices/windowSlice';
import { AppStore, RootState, setupStore } from './state/store';
import {
  WindowContext,
  WindowContextProvider,
  WindowsRefType,
} from './windows/windowContext';

/**
 * Waits for msw request -
 * @param method string representing the HTTP method
 * @param url string representing the URL match for the route
 * @returns a promise of the matching request
 *  */
export function waitForRequest(method: string, url: string) {
  let newRequestId = '';

  return new Promise<Request>((resolve, reject) => {
    const onRequestStart = ({
      request,
      requestId,
    }: {
      request: Request;
      requestId: string;
    }) => {
      const requestURL = new URL(request.url);
      const matchesMethod =
        request.method.toLowerCase() === method.toLowerCase();

      const matchesUrl = matchRequestUrl(requestURL, url).matches;

      if (matchesMethod && matchesUrl) {
        newRequestId = requestId;
      }
    };

    const onRequestMatch = ({
      request,
      requestId,
    }: {
      request: Request;
      requestId: string;
    }) => {
      if (requestId === newRequestId) {
        server.events.removeListener('request:start', onRequestStart);
        server.events.removeListener('request:match', onRequestMatch);
        server.events.removeListener('request:unhandled', onRequestUnhandled);
        resolve(request);
      }
    };

    const onRequestUnhandled = ({
      request,
      requestId,
    }: {
      request: Request;
      requestId: string;
    }) => {
      const requestURL = new URL(request.url);
      if (requestId === newRequestId) {
        server.events.removeListener('request:start', onRequestStart);
        server.events.removeListener('request:match', onRequestMatch);
        server.events.removeListener('request:unhandled', onRequestUnhandled);
        reject(
          new Error(
            `The ${request.method} ${requestURL.href} request was unhandled.`
          )
        );
      }
    };

    server.events.on('request:start', onRequestStart);

    server.events.on('request:match', onRequestMatch);

    server.events.on('request:unhandled', onRequestUnhandled);
  });
}

export let actions: Action[] = [];
export const resetActions = (): void => {
  actions = [];
};
export const getInitialState = (): RootState => ({
  config: initialConfigState,
  table: initialTableState,
  search: initialSearchStateFunc(),
  plots: initialPlotState,
  filter: initialFilterState,
  functions: initialFunctionsState,
  windows: initialWindowsState,
  selection: initialSelectionState,
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
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  queryClient?: QueryClient;
  windowsRef?: React.MutableRefObject<WindowsRefType>;
}

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 300000,
      },
    },
  });

export const hooksWrapperWithProviders = (
  state = {},
  queryClient?: QueryClient
) => {
  const testQueryClient = queryClient ?? createTestQueryClient();
  const store = setupStore(state);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
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
    windowsRef,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    const WindowsProvider = windowsRef
      ? WindowContext.Provider
      : WindowContextProvider;
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <WindowsProvider {...(windowsRef ? { value: windowsRef } : {})}>
            {children}
          </WindowsProvider>
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

export function renderComponentWithStoreAndWindows(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    windowsRef,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    const WindowsProvider = windowsRef
      ? WindowContext.Provider
      : WindowContextProvider;
    if (windowsRef && windowsRef.current === null) windowsRef.current = {};
    return (
      <Provider store={store}>
        <WindowsProvider {...(windowsRef ? { value: windowsRef } : {})}>
          {children}
        </WindowsProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

export const testChannels = [
  ...Object.values(staticChannels),
  ...Object.entries(channelsJson.channels).map(
    ([systemName, channel]) =>
      ({
        systemName,
        ...channel,
      }) as FullChannelMetadata
  ),
];

export const testScalarChannels: FullScalarChannelMetadata[] = [
  ...Object.values(staticChannels).filter(
    (channel) => channel.type === 'scalar'
  ),
  ...Object.entries(channelsJson.channels)
    .filter(([_systemName, channel]) => channel.type === 'scalar')
    .map(
      ([systemName, channel]) =>
        ({
          systemName,
          ...channel,
        }) as FullScalarChannelMetadata
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
    id: `test-plot-id-${num}`,
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
