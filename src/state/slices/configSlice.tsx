import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { MaxShotType, settings, type WorkingHours } from '../../settings';
import { AppDispatch, RootState } from '../store';
import {
  defaultMaxShotOptions,
  initialiseDefaultMaxShots,
} from './searchSlice';

interface URLs {
  apiUrl: string;
}

// Define a type for the slice state
interface ConfigState {
  urls: URLs;
  recordLimitWarning: number;
  maxShots: MaxShotType[];
  pluginHost: string;
  settingsLoaded: boolean;
  workingHours: WorkingHours;
  plotAxisSigFigs?: string;
}

// Define the initial state using that type
export const initialState: ConfigState = {
  urls: {
    apiUrl: '',
  },
  recordLimitWarning: -1,
  maxShots: defaultMaxShotOptions,
  pluginHost: '',
  settingsLoaded: false,
  workingHours: { start: 9, end: 18 },
};

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
    loadMaxShotsSetting: (state, action: PayloadAction<MaxShotType[]>) => {
      state.maxShots = action.payload;
    },
    loadWorkingHoursSetting: (state, action: PayloadAction<WorkingHours>) => {
      state.workingHours = action.payload;
    },
    loadPlotAxisSigFigsSetting: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.plotAxisSigFigs = action.payload;
    },
  },
});

export const {
  settingsLoaded,
  loadPluginHostSetting,
  loadUrls,
  loadRecordLimitWarningSetting,
  loadMaxShotsSetting,
  loadWorkingHoursSetting,
  loadPlotAxisSigFigsSetting,
} = configSlice.actions;

export const selectUrls = (state: RootState) => state.config.urls;
export const selectRecordLimitWarning = (state: RootState) =>
  state.config.recordLimitWarning;
export const selectMaxShots = (state: RootState) => state.config.maxShots;
export const selectWorkingHours = (state: RootState) =>
  state.config.workingHours;
export const selectPlotAxisSigFigs = (state: RootState) =>
  state.config.plotAxisSigFigs;

// Defining a thunk
export const configureApp = () => async (dispatch: AppDispatch) => {
  const settingsResult = await settings;
  if (settingsResult) {
    dispatch(
      loadUrls({
        apiUrl: settingsResult['apiUrl'],
      })
    );

    dispatch(
      loadRecordLimitWarningSetting(settingsResult['recordLimitWarning'])
    );

    dispatch(loadMaxShotsSetting(settingsResult['maxShots']));
    dispatch(initialiseDefaultMaxShots(settingsResult['maxShots']));

    if (settingsResult['pluginHost'] !== undefined) {
      dispatch(loadPluginHostSetting(settingsResult['pluginHost']));
    }

    if (settingsResult['workingHours'] !== undefined) {
      dispatch(loadWorkingHoursSetting(settingsResult['workingHours']));
    }

    if (settingsResult['plotAxisSigFigs'] !== undefined) {
      dispatch(loadPlotAxisSigFigsSetting(settingsResult['plotAxisSigFigs']));
    }

    dispatch(settingsLoaded());
  }
};

export default configSlice.reducer;
