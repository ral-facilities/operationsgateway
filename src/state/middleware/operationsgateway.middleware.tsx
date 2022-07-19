import log from 'loglevel';
import {
  registerRoute,
  requestPluginRerender,
  CustomFrontendMessageType,
  sendThemeOptions,
  broadcastSignOut,
} from '../scigateway.actions';
import { MicroFrontendId } from '../../app.types';
import { AppDispatch } from '../store';
import { AnyAction, Dispatch, Middleware } from '@reduxjs/toolkit';

const broadcastMessage = (action: AnyAction): void => {
  document.dispatchEvent(new CustomEvent(MicroFrontendId, { detail: action }));
};

type microFrontendMessageType = CustomEvent<AnyAction>;

export const listenToMessages = (dispatch: AppDispatch): void => {
  document.addEventListener(MicroFrontendId, (event) => {
    const pluginMessage = event as microFrontendMessageType;

    if (
      pluginMessage.detail &&
      pluginMessage.detail.type &&
      (pluginMessage.detail.type.startsWith(CustomFrontendMessageType) ||
        pluginMessage.detail.type.startsWith('operationsgateway:api:'))
    ) {
      // this is a valid message, so process it
      // blank if body = ignore message as it's not processed by this plugin
      if (requestPluginRerender.match(pluginMessage.detail)) {
      } else if (registerRoute.match(pluginMessage.detail)) {
      } else if (sendThemeOptions.match(pluginMessage.detail)) {
      } else if (broadcastSignOut.match(pluginMessage.detail)) {
      } else {
        // log and ignore
        log.warn(
          `Unexpected message received, not dispatched:\nevent.detail = ${JSON.stringify(
            pluginMessage.detail
          )}`
        );
      }
    } else {
      log.error(
        `Invalid message received:\nevent.detail = ${JSON.stringify(
          pluginMessage.detail
        )}`
      );
    }
  });
};

const OperationsGatewayMiddleware: Middleware =
  () =>
  (next: Dispatch) =>
  (action: AnyAction): AnyAction => {
    if (action.payload && action.payload.broadcast) {
      broadcastMessage(action);
    }

    return next(action);
  };

export default OperationsGatewayMiddleware;
