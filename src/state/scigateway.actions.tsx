import { Theme } from '@mui/material';
import { createAction } from '@reduxjs/toolkit';
import { MicroFrontendId } from '../app.types';

export const CustomFrontendMessageType = `${MicroFrontendId}:api`;
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
export const broadcastSignOut = createAction(
  `${CustomFrontendMessageType}:signout`
);

export interface PluginRoute {
  section: string;
  link: string;
  displayName: string;
  admin?: boolean;
  hideFromMenu?: boolean;
  order: number;
}
