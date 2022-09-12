import React from 'react';
import ViewTabs from './views/viewTabs.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { configureApp } from './state/slices/configSlice';
import { requestPluginRerender } from './state/scigateway.actions';
import { MicroFrontendId } from './app.types';
import { useAppDispatch } from './state/hooks';
import OGThemeProvider from './ogThemeProvider.component';
import OpenPlots from './plotting/openPlots.component';
import { RootState } from './state/store';
import { connect } from 'react-redux';
import Preloader from './preloader/preloader.component';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
    },
  },
});

function mapPreloaderStateToProps(state: RootState): { loading: boolean } {
  return {
    loading: !state.config.settingsLoaded,
  };
}

export const ConnectedPreloader = connect(mapPreloaderStateToProps)(Preloader);

const App: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
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
      <OGThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ConnectedPreloader>
            <React.Suspense
              fallback={<Preloader loading={true}>Finished loading</Preloader>}
            >
              <ViewTabs />
              {/* Open plots is it's own component so that the open plots are always mounted
                  no matter which other components the user has mounted in ViewTabs etc. */}
              <OpenPlots />
            </React.Suspense>
          </ConnectedPreloader>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </OGThemeProvider>
    </div>
  );
};

export default App;
