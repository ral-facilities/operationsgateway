import { PluginRoute } from './state/scigateway.actions';

export interface OperationsGatewaySettings {
  apiUrl: string;
  recordLimitWarning: number;
  routes: PluginRoute[];
  helpSteps?: { target: string; content: string }[];
  pluginHost?: string;
}

export let settings: Promise<OperationsGatewaySettings | void>;
export const setSettings = (
  newSettings: Promise<OperationsGatewaySettings | void>
): void => {
  settings = newSettings;
};
