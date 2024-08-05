import React from 'react';
import ViewTabs from './views/viewTabs.component';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { configureApp } from './state/slices/configSlice';
import { requestPluginRerender } from './state/scigateway.actions';
import { MicroFrontendId } from './app.types';
import OGThemeProvider from './ogThemeProvider.component';
import OpenWindows from './windows/openWindows.component';
import { store, RootState } from './state/store';
import { connect, Provider } from 'react-redux';
import Preloader from './preloader/preloader.component';
import './App.css';
import SettingsMenuItems from './settingsMenuItems.component';
import { WindowContextProvider } from './windows/windowContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
    },
  },
  // TODO: implement proper error handling
  queryCache: new QueryCache({
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
  }),
});

function mapPreloaderStateToProps(state: RootState): { loading: boolean } {
  return {
    loading: !state.config.settingsLoaded,
  };
}

export const ConnectedPreloader = connect(mapPreloaderStateToProps)(Preloader);

const App: React.FunctionComponent = () => {
  const dispatch = store.dispatch;
  React.useEffect(() => {
    dispatch(configureApp());
  }, [dispatch]);

  // we need to call forceUpdate if SciGateway tells us to rerender
  // but there's no forceUpdate in functional components, so this is the hooks equivalent
  // see https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  function handler(e: Event): void {
    // attempt to re-render the plugin if we get told to
    const action = (e as CustomEvent).detail;
    if (requestPluginRerender.match(action)) {
      forceUpdate();
    }
  }

  React.useEffect(() => {
    document.addEventListener(MicroFrontendId, handler);
    return () => {
      document.removeEventListener(MicroFrontendId, handler);
    };
  }, []);

  return (
    <div className="App">
      <Provider store={store}>
        <OGThemeProvider>
          <WindowContextProvider>
            <QueryClientProvider client={queryClient}>
              <ConnectedPreloader>
                <React.Suspense
                  fallback={
                    <Preloader loading={true}>Finished loading</Preloader>
                  }
                >
                  <ViewTabs />
                  {/* Open windows is it's own component so that the open windows are always mounted
                  no matter which other components the user has mounted in ViewTabs etc. */}
                  <OpenWindows />
                  <SettingsMenuItems />
                </React.Suspense>
              </ConnectedPreloader>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </WindowContextProvider>
        </OGThemeProvider>
      </Provider>
    </div>
  );
};

export default App;
