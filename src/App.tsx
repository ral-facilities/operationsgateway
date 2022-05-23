import React from "react";
import * as log from "loglevel";
import { pluginName } from ".";
import RecordTable from "./views/recordTable.component";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

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
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`${pluginName} failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error">
          {/* <React.Suspense
            fallback={<Preloader loading={true}>Finished loading</Preloader>}
          >
            <div
              style={{
                padding: 20,
                background: 'red',
                color: 'white',
                margin: 5,
              }}
            >
              <Translation>{(t) => t('app.error')}</Translation>
            </div>
          </React.Suspense> */}
          <p>Error</p>
        </div>
      );
    }

    return (
      <div className="App">
        <QueryClientProvider client={queryClient}>
          <RecordTable />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </div>
    );
  }
}

export default App;
