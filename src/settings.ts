import { PluginRoute } from './state/actions/actions.types';

export interface OperationsGatewaySettings {
  apiUrl: string;
  routes: PluginRoute[];
}

export let settings: Promise<OperationsGatewaySettings | void>;
export const setSettings = (
  newSettings: Promise<OperationsGatewaySettings | void>
): void => {
  settings = newSettings;
};
