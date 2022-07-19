import React from 'react';
import RecordTable from './views/recordTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { resultsPerPage } from './recordGeneration';
import { configureSite } from './state/slices/configSlice';
import { requestPluginRerender } from './state/scigateway.actions';
import { MicroFrontendId } from './app.types';
import { useAppDispatch } from './state/hooks';
import OGThemeProvider from './ogThemeProvider.component';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
    },
  },
});

const App: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(configureSite());
  }, [dispatch]);

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
          <RecordTable resultsPerPage={resultsPerPage} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </OGThemeProvider>
    </div>
  );
};

export default App;
