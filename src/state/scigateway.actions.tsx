import { Theme } from '@mui/material';
import { createAction } from '@reduxjs/toolkit';
import { MicroFrontendId } from '../app.types';

export const CustomFrontendMessageType = `${MicroFrontendId}:api`;

export const NotificationType = `${CustomFrontendMessageType}:notification`;
export const InvalidateTokenType = `${CustomFrontendMessageType}:invalidate_token`;

// parent app actions
export const registerRoute = createAction(
  `${CustomFrontendMessageType}:register_route`
);
export const requestPluginRerender = createAction(
  `${CustomFrontendMessageType}:plugin_rerender`
);
export const sendThemeOptions = createAction<{ theme: Theme }>(
  `${CustomFrontendMessageType}:send_themeoptions`
);
export const tokenRefreshed = createAction(
  `${CustomFrontendMessageType}:token_refreshed`
);
export const broadcastSignOut = createAction(
  `${CustomFrontendMessageType}:signout`
);

export interface PluginRoute {
  section: string;
  link: string;
  displayName: string;
  admin?: boolean;
  hideFromMenu?: boolean;
  unauthorised?: boolean;
  order: number;
}
