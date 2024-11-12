import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { connect, Provider } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import UsersTable from './admin/users/usersTable.component';
import './App.css';
import { MicroFrontendId } from './app.types';
import OGThemeProvider from './ogThemeProvider.component';
import Preloader from './preloader/preloader.component';
import SettingsMenuItems from './settingsMenuItems.component';
import { requestPluginRerender } from './state/scigateway.actions';
import { configureApp } from './state/slices/configSlice';
import { RootState, store } from './state/store';
import ViewTabs from './views/viewTabs.component';
import OpenWindows from './windows/openWindows.component';
import { WindowContextProvider } from './windows/windowContext';

export const paths = {
  any: '*',
  adminUsers: '/admin/users',
};

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
      { path: paths.adminUsers, Component: UsersTable },
    ],
  },
]);
export default function App() {
  return <RouterProvider router={router} />;
}
