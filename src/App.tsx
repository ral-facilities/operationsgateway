import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AxiosError } from 'axios';
import React from 'react';
import { connect, Provider } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';
import UsersTable from './admin/users/usersTable.component';
import {
  clearFailedAuthRequestsQueue,
  retryFailedAuthRequests,
} from './api/api';
import './App.css';
import { MicroFrontendId } from './app.types';
import handleOG_APIError from './handleOG_APIError';
import OGThemeProvider from './ogThemeProvider.component';
import PageNotFoundComponent from './pageNotFound/pageNotFound.component';
import Preloader from './preloader/preloader.component';
import retryOG_APIErrors from './retryOG_APIErrors';
import SettingsMenuItems from './settings/settingsMenuItems.component';
import {
  broadcastSignOut,
  requestPluginRerender,
  tokenRefreshed,
} from './state/scigateway.actions';
import { configureApp } from './state/slices/configSlice';
import { RootState, store } from './state/store';
import ViewTabs from './views/viewTabs.component';
import OpenWindows from './windows/openWindows.component';
import { WindowContextProvider } from './windows/windowContext';

export const paths = {
  any: '*',
  admin: '/admin',
  adminUsers: '/admin/users',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
      retry: (failureCount, error) => {
        return retryOG_APIErrors(failureCount, error as AxiosError);
      },
    },
  },

  queryCache: new QueryCache({
    onError: (error) => {
      handleOG_APIError(error as AxiosError);
    },
  }),
});

function mapPreloaderStateToProps(state: RootState): { loading: boolean } {
  return {
    loading: !state.config.settingsLoaded,
  };
}

export const ConnectedPreloader = connect(mapPreloaderStateToProps)(Preloader);

const Layout: React.FunctionComponent = () => {
  const dispatch = store.dispatch;
  React.useEffect(() => {
    dispatch(configureApp());
  }, [dispatch]);

  // we need to call forceUpdate if SciGateway tells us to rerender
  // but there's no forceUpdate in functional components, so this is the hooks equivalent
  // see https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate

  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  function handler(e: Event): void {
    // attempt to re-render the plugin if we get told to
    const action = (e as CustomEvent).detail;
    if (requestPluginRerender.match(action)) {
      forceUpdate();
    } else if (tokenRefreshed.match(action)) retryFailedAuthRequests();
    else if (broadcastSignOut.match(action)) clearFailedAuthRequestsQueue();
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
                  <Outlet />
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

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: paths.any, Component: ViewTabs },
      {
        path: paths.admin,
        Component: Outlet,
        ErrorBoundary: PageNotFoundComponent,
        children: [
          { path: paths.adminUsers, Component: UsersTable },
          {
            path: '*',
            Component: PageNotFoundComponent,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
