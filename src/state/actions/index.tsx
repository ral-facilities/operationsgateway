import {
  SettingsLoadedType,
  ConfigureURLsPayload,
  ConfigureURLsType,
} from './actions.types';
import { URLs, ActionType, ThunkResult } from '../state.types';
import { settings } from '../../settings';
import { Action } from 'redux';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const loadUrls = (urls: URLs): ActionType<ConfigureURLsPayload> => ({
  type: ConfigureURLsType,
  payload: {
    urls,
  },
});

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async (dispatch) => {
    const settingsResult = await settings;
    if (settingsResult) {
      dispatch(
        loadUrls({
          apiUrl: settingsResult['apiUrl'],
        })
      );

      dispatch(settingsLoaded());
    }
  };
};
