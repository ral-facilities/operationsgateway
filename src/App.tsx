import React from 'react';
import RecordTable from './views/recordTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { resultsPerPage } from './recordGeneration';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
    },
  },
});

const App: React.FunctionComponent = () => {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <RecordTable resultsPerPage={resultsPerPage} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
};

export default App;
