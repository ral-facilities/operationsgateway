// hacktimer needs to be first import
// it puts all timer functionality in a web worker to avoid browsers throttling
// timers when main window is hidden (needed for popups to be more responsive
// in cases like main OG window tabbed out, or minimized etc)
import 'hacktimer';
//
import axios from 'axios';
import log from 'loglevel';
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';
import { MicroFrontendToken } from './app.types';
import { fetchSettings, setSettings } from './settings';

export const pluginName = 'operationsgateway';

const render = (): void => {
  const el = document.getElementById(pluginName);
  if (!el) throw new Error(`${pluginName} div missing in index.html`);

  const root = ReactDOMClient.createRoot(el);
  root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
};

function domElementGetter(): HTMLElement {
  // Make sure there is a div for us to render into
  let el = document.getElementById(pluginName);
  if (!el) {
    el = document.createElement('div');
  }

  return el;
}

// This was throwing a warning that rootComponent was not found even if it was defined
// Defining loadRootComponent did not throw this warning
// May be worth investigating further
const reactLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: () => (document.getElementById(pluginName) ? <App /> : null),
  domElementGetter,
  errorBoundary: (error) => {
    log.error(`${pluginName} failed with error: ${error}`);
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
  },
});

// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: unknown): Promise<void> {
  return reactLifecycles
    .bootstrap(props)
    .then(() => {
      log.info(`${pluginName} has been successfully bootstrapped`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst bootstrapping: ${error}`);
    });
}

export function mount(props: unknown): Promise<void> {
  return reactLifecycles
    .mount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully mounted`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst mounting: ${error}`);
    });
}

export function unmount(props: unknown): Promise<void> {
  return reactLifecycles
    .unmount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully unmounted`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst unmounting: ${error}`);
    });
}

const settings = fetchSettings();
setSettings(settings);

/* Renders only if we're not being loaded by SG  */
const conditionalSciGatewayRender = () => {
  if (!document.getElementById('scigateway')) {
    render();
  }
};

async function prepare() {
  if (import.meta.env.DEV || import.meta.env.VITE_APP_INCLUDE_MSW === 'true') {
    // When in dev, only use MSW if the api url is given, otherwise load MSW as it must have been explicitly requested
    const settingsResult = await settings;
    if (
      import.meta.env.VITE_APP_INCLUDE_MSW === 'true' ||
      settingsResult?.apiUrl === ''
    ) {
      const { worker } = await import('./mocks/browser');
      return worker.start({
        onUnhandledRequest(request, print) {
          // Ignore unhandled requests to non-localhost things (normally means you're contacting a real server)
          if (request.url.includes('localhost')) {
            return;
          }

          print.warning();
        },
      });
    } else return Promise.resolve();
  }
  return Promise.resolve();
}

if (import.meta.env.DEV || import.meta.env.VITE_APP_INCLUDE_MSW === 'true') {
  prepare().then(() => {
    conditionalSciGatewayRender();

    log.setDefaultLevel(log.levels.DEBUG);
    if (import.meta.env.DEV) {
      settings.then((settingsResult) => {
        if (settingsResult) {
          const apiUrl = settingsResult.apiUrl;
          axios
            .post(`${apiUrl}/login`, {
              username: import.meta.env.VITE_OG_API_USERNAME,
              password: import.meta.env.VITE_OG_API_PASSWORD,
            })
            .then((response) => {
              window.localStorage.setItem(MicroFrontendToken, response.data);
            })
            .catch((error) => log.error(`Got error: ${error.message}`));
        }
      });
    }
  });
} else {
  conditionalSciGatewayRender();

  log.setDefaultLevel(log.levels.ERROR);
}
