import {
  ConfigurePluginHostSettingPayload,
  ConfigurePluginHostSettingType,
  ConfigureURLsPayload,
  ConfigureURLsType,
  SettingsLoadedType,
} from '../actions/actions.types';
import { OperationsGatewayState } from '../state.types';
import createReducer from './createReducer';

export const initialState: OperationsGatewayState = {
  urls: {
    apiUrl: '',
  },
  pluginHost: '',
  settingsLoaded: false,
};

export function handleConfigureUrls(
  state: OperationsGatewayState,
  payload: ConfigureURLsPayload
): OperationsGatewayState {
  return {
    ...state,
    urls: payload.urls,
  };
}

export function handleSettingsLoaded(
  state: OperationsGatewayState
): OperationsGatewayState {
  return {
    ...state,
    settingsLoaded: true,
  };
}

export function handleConfigurePluginHostSetting(
  state: OperationsGatewayState,
  payload: ConfigurePluginHostSettingPayload
): OperationsGatewayState {
  return {
    ...state,
    pluginHost: payload.settings,
  };
}

const operationsGatewayReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureURLsType]: handleConfigureUrls,
  [ConfigurePluginHostSettingType]: handleConfigurePluginHostSetting,
});

export default operationsGatewayReducer;
