import { MicroFrontendId } from '../../app.types';
import { URLs } from '../state.types';

// parent app actions
export const CustomFrontendMessageType = `${MicroFrontendId}:api`;
export const RegisterRouteType = `${CustomFrontendMessageType}:register_route`;
export const RequestPluginRerenderType = `${CustomFrontendMessageType}:plugin_rerender`;
export const SendThemeOptionsType = `${CustomFrontendMessageType}:send_themeoptions`;
export const BroadcastSignOutType = `${CustomFrontendMessageType}:signout`;

// internal actions
export const SettingsLoadedType = 'operationsgateway:settings_loaded';
export const ConfigureURLsType = 'operationsgateway:configure_urls';

export interface PluginRoute {
  section: string;
  link: string;
  displayName: string;
  admin?: boolean;
  hideFromMenu?: boolean;
  order: number;
}

export interface ConfigureURLsPayload {
  urls: URLs;
}
