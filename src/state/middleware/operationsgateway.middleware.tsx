import { Middleware, UnknownAction, isAction } from '@reduxjs/toolkit';
import log from 'loglevel';
import { MicroFrontendId } from '../../app.types';
import {
  CustomFrontendMessageType,
  broadcastSignOut,
  registerRoute,
  requestPluginRerender,
  sendThemeOptions,
} from '../scigateway.actions';
import { AppDispatch, RootState } from '../store';

const broadcastMessage = (action: UnknownAction): void => {
  document.dispatchEvent(new CustomEvent(MicroFrontendId, { detail: action }));
};

type microFrontendMessageType = CustomEvent<UnknownAction>;

export const listenToMessages = (_dispatch: AppDispatch): void => {
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
      if (
        !(
          requestPluginRerender.match(pluginMessage.detail) ||
          registerRoute.match(pluginMessage.detail) ||
          sendThemeOptions.match(pluginMessage.detail) ||
          broadcastSignOut.match(pluginMessage.detail)
        )
      ) {
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

const OperationsGatewayMiddleware: Middleware<unknown, RootState> =
  () => (next) => (action: unknown) => {
    if (isAction(action)) {
      if (
        (action as { payload?: { broadcast?: boolean } }).payload?.broadcast
      ) {
        broadcastMessage(action);
      }
    }

    return next(action);
  };

export default OperationsGatewayMiddleware;
