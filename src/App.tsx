import React from 'react';
import RecordTable from './views/recordTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { resultsPerPage } from './recordGeneration';
import store from './state/store';
import { Provider } from 'react-redux';
import { configureApp } from './state/actions';
import { ThunkDispatch } from 'redux-thunk';
import { OperationsGatewayState } from './state/state.types';
import { AnyAction } from 'redux';
import { MicroFrontendId } from './app.types';
import { RequestPluginRerenderType } from './state/actions/actions.types';
import * as log from 'loglevel';
import { listenToMessages } from './state/middleware/operationsgateway.middleware';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
    },
  },
});

class App extends React.Component<unknown, { hasError: boolean }> {
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
    this.handler = this.handler.bind(this);

    listenToMessages(store.dispatch);
    const dispatch = store.dispatch as ThunkDispatch<
      OperationsGatewayState,
      null,
      AnyAction
    >;
    dispatch(configureApp());
  }

  handler(e: Event): void {
    // attempt to re-render the plugin if we get told to
    const action = (e as CustomEvent).detail;
    if (action.type === RequestPluginRerenderType) {
      this.forceUpdate();
    }
  }

  public componentDidMount(): void {
    document.addEventListener(MicroFrontendId, this.handler);
  }

  public componentWillUnmount(): void {
    document.removeEventListener(MicroFrontendId, this.handler);
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`operationsgateway failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error">
          <p>Error</p>
        </div>
      );
    } else
      return (
        <div className="App">
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <RecordTable resultsPerPage={resultsPerPage} />
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </Provider>
        </div>
      );
  }
}

export default App;
