// hacktimer needs to be first import
// it puts all timer functionality in a web worker to avoid browsers throttling
// timers when main window is hidden (needed for popups to be more responsive
// in cases like main OG window tabbed out, or minimized etc)
import 'hacktimer';
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import App from './App';
import * as log from 'loglevel';
import singleSpaReact from 'single-spa-react';
import axios from 'axios';
import { MicroFrontendId, MicroFrontendToken } from './app.types';
import { PluginRoute, registerRoute } from './state/scigateway.actions';
import { OperationsGatewaySettings, setSettings } from './settings';

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

// only export this for testing
export const fetchSettings = (): Promise<OperationsGatewaySettings | void> => {
  const settingsPath = process.env.REACT_APP_OPERATIONSGATEWAY_BUILD_DIRECTORY
    ? process.env.REACT_APP_OPERATIONSGATEWAY_BUILD_DIRECTORY +
      'operationsgateway-settings.json'
    : '/operationsgateway-settings.json';
  return axios
    .get<OperationsGatewaySettings>(settingsPath)
    .then((res) => {
      const settings = res.data;

      // invalid settings.json
      if (typeof settings !== 'object') {
        throw Error('Invalid format');
      }

      if (!('apiUrl' in settings)) {
        throw new Error('apiUrl is undefined in settings');
      }

      // Ensure a limit on how many records can be requested before displaying a warning is present
      if (!('recordLimitWarning' in settings)) {
        throw new Error('recordLimitWarning is undefined in settings');
      }

      if (Array.isArray(settings['routes']) && settings['routes'].length) {
        settings['routes'].forEach((route: PluginRoute, index: number) => {
          if ('section' in route && 'link' in route && 'displayName' in route) {
            const registerRouteAction = {
              type: registerRoute.type,
              payload: {
                section: route['section'],
                link: route['link'],
                plugin: 'operationsgateway',
                displayName: route['displayName'],
                order: route['order'] ?? 0,
                hideFromMenu: route['hideFromMenu'] ?? false,
                admin: route['admin'] ?? false,
                helpSteps:
                  index === 0 && 'helpSteps' in settings
                    ? settings['helpSteps']
                    : [],
              },
            };
            document.dispatchEvent(
              new CustomEvent(MicroFrontendId, {
                detail: registerRouteAction,
              })
            );
          } else {
            throw new Error(
              'Route provided does not have all the required entries (section, link, displayName)'
            );
          }
        });
      } else {
        throw new Error('No routes provided in the settings');
      }
      return settings;
    })
    .catch((error) => {
      log.error(`Error loading ${settingsPath}: ${error.message}`);
    });
};

const settings = fetchSettings();
setSettings(settings);

async function prepare() {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.REACT_APP_E2E_TESTING === 'true'
  ) {
    const settingsResult = await settings;
    if (settingsResult?.apiUrl === '') {
      // need to use require instead of import as import breaks when loaded in SG
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { worker } = require('./mocks/browser');
      return worker.start();
    } else return Promise.resolve();
  }
  return Promise.resolve();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.REACT_APP_E2E_TESTING === 'true'
) {
  prepare().then(() => {
    // use this to detect if we're being loaded by SG
    // if we're not, then we need to call render ourselves
    if (!document.getElementById('scigateway')) {
      render();
    }
  });
  log.setDefaultLevel(log.levels.DEBUG);

  if (process.env.NODE_ENV === `development`) {
    settings.then((settingsResult) => {
      if (settingsResult) {
        const apiUrl = settingsResult.apiUrl;
        axios
          .post(`${apiUrl}/login`, {
            username: 'frontend',
            password: 'front',
          })
          .then((response) => {
            window.localStorage.setItem(MicroFrontendToken, response.data);
          })
          .catch((error) => log.error(`Got error: ${error.message}`));
      }
    });
  }
} else {
  log.setDefaultLevel(log.levels.ERROR);
}
