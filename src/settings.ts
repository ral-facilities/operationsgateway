import axios from 'axios';
import log from 'loglevel';
import { MicroFrontendId } from './app.types';
import { registerRoute, type PluginRoute } from './state/scigateway.actions';
import LogoDark from '/operationsgateway-logo-white.svg';
import LogoLight from '/operationsgateway-logo.svg';

export interface WorkingHours {
  start: number;
  end: number;
}

export interface MaxShotType {
  value: number | 'Unlimited'; // JSON doesn't support infinity as a number so have to use a string
  default?: boolean;
}

export interface OperationsGatewaySettings {
  apiUrl: string;
  recordLimitWarning: number;
  maxShots: MaxShotType[];
  routes: PluginRoute[];
  helpSteps?: { target: string; content: string }[];
  pluginHost?: string;
  workingHours?: WorkingHours;
  plotAxisSigFigs?: string;
}

export let settings: Promise<OperationsGatewaySettings | void>;
export const setSettings = (
  newSettings: Promise<OperationsGatewaySettings | void>
): void => {
  settings = newSettings;
};

export const fetchSettings = (): Promise<OperationsGatewaySettings | void> => {
  const settingsPath = import.meta.env
    .VITE_APP_OPERATIONS_GATEWAY_BUILD_DIRECTORY
    ? import.meta.env.VITE_APP_OPERATIONS_GATEWAY_BUILD_DIRECTORY +
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

      // Ensure max shots definition is present and that no more than 1 is default and valid value type
      if (!('maxShots' in settings)) {
        throw new Error('maxShots is undefined in settings');
      }
      if (settings.maxShots.filter((x) => x.default === true).length > 1) {
        throw new Error(
          'More than one default max shot is defined in the settings'
        );
      }
      if (
        settings.maxShots.some(
          (x) => typeof x.value !== 'number' && x.value !== 'Unlimited'
        )
      ) {
        throw new Error(
          'Some max shots have a non-number, non-"Unlimited" value in the settings'
        );
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
                unauthorised: route['unauthorised'] ?? false,
                helpSteps:
                  index === 0 && 'helpSteps' in settings
                    ? settings['helpSteps']
                    : [],
                logoLightMode: settings['pluginHost']
                  ? settings['pluginHost'] + LogoLight
                  : undefined,
                logoDarkMode: settings['pluginHost']
                  ? settings['pluginHost'] + LogoDark
                  : undefined,
                logoAltText: 'OperationsGateway',
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
