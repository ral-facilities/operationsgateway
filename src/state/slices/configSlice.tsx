import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../store';
import { settings } from '../../settings';
import { RootState } from '../store';

interface URLs {
  apiUrl: string;
}

// Define a type for the slice state
interface ConfigState {
  urls: URLs;
  recordLimitWarning: number;
  pluginHost: string;
  settingsLoaded: boolean;
}

// Define the initial state using that type
export const initialState = {
  urls: {
    apiUrl: '',
  },
  recordLimitWarning: -1,
  pluginHost: '',
  settingsLoaded: false,
} as ConfigState;

export const configSlice = createSlice({
  name: 'config',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    settingsLoaded: (state) => {
      state.settingsLoaded = true;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    loadPluginHostSetting: (state, action: PayloadAction<string>) => {
      state.pluginHost = action.payload;
    },
    loadUrls: (state, action: PayloadAction<URLs>) => {
      state.urls = action.payload;
    },
    loadRecordLimitWarningSetting: (state, action: PayloadAction<number>) => {
      state.recordLimitWarning = action.payload;
    },
  },
});

export const {
  settingsLoaded,
  loadPluginHostSetting,
  loadUrls,
  loadRecordLimitWarningSetting,
} = configSlice.actions;

export const selectUrls = (state: RootState) => state.config.urls;
export const selectRecordLimitWarning = (state: RootState) =>
  state.config.recordLimitWarning;

// Defining a thunk
export const configureApp = () => async (dispatch: AppDispatch) => {
  const settingsResult = await settings;
  if (settingsResult) {
    dispatch(
      loadUrls({
        apiUrl: settingsResult['apiUrl'],
      })
    );

    if (settingsResult['recordLimitWarning'] !== undefined) {
      dispatch(
        loadRecordLimitWarningSetting(settingsResult['recordLimitWarning'])
      );
    }

    if (settingsResult['pluginHost'] !== undefined) {
      dispatch(loadPluginHostSetting(settingsResult['pluginHost']));
    }

    dispatch(settingsLoaded());
  }
};

export default configSlice.reducer;
