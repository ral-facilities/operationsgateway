import Category from '@mui/icons-material/Category';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { staticChannels } from '../../api/channels';
import { columnIconMappings } from '../../app.types';
import {
  InitialChannelsConfigType,
  MaxShotType,
  settings,
  type WorkingHours,
} from '../../settings';
import { AppDispatch, RootState } from '../store';
import { defaultMaxShotOptions } from './searchSlice';

interface URLs {
  apiUrl: string;
}

// Define a type for the slice state
interface ConfigState {
  urls: URLs;
  recordLimitWarning: number;
  maxShots: MaxShotType[];
  initialChannels: InitialChannelsConfigType;
  pluginHost: string;
  settingsLoaded: boolean;
  workingHours: WorkingHours;
  plotAxisSigFigs?: string;
  dataTypes?: string[];
}

// Define the initial state using that type
export const initialState: ConfigState = {
  urls: {
    apiUrl: '',
  },
  recordLimitWarning: -1,
  maxShots: defaultMaxShotOptions,
  initialChannels: { timestamp: { removable: false, sticky: true } },
  pluginHost: '',
  settingsLoaded: false,
  workingHours: { start: 9, end: 18 },
  dataTypes: undefined,
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
    loadInitialChannelsSetting: (
      state,
      action: PayloadAction<InitialChannelsConfigType>
    ) => {
      state.initialChannels = action.payload;
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
    loadDataTypesSetting: (state, action: PayloadAction<string[]>) => {
      state.dataTypes = action.payload;
    },
  },
});

export const {
  settingsLoaded,
  loadPluginHostSetting,
  loadUrls,
  loadRecordLimitWarningSetting,
  loadMaxShotsSetting,
  loadInitialChannelsSetting,
  loadWorkingHoursSetting,
  loadPlotAxisSigFigsSetting,
  loadDataTypesSetting,
} = configSlice.actions;

export const selectUrls = (state: RootState) => state.config.urls;
export const selectRecordLimitWarning = (state: RootState) =>
  state.config.recordLimitWarning;
export const selectMaxShots = (state: RootState) => state.config.maxShots;
const selectInitialChannelConfig = (state: RootState) =>
  state.config.initialChannels;
export const selectNonRemovableChannels = createSelector(
  selectInitialChannelConfig,
  (initialChannels) => {
    return Object.entries(initialChannels).reduce(
      (filtered, [channelName, channelOptions]) => {
        if (!channelOptions.removable) {
          filtered.push(channelName);
        }
        return filtered;
      },
      [] as string[]
    );
  }
);
export const selectStickyChannels = createSelector(
  selectInitialChannelConfig,
  (initialChannels) => {
    return Object.entries(initialChannels).reduce(
      (filtered, [channelName, channelOptions]) => {
        if (channelOptions.sticky) {
          filtered.push(channelName);
        }
        return filtered;
      },
      [] as string[]
    );
  }
);
export const selectWorkingHours = (state: RootState) =>
  state.config.workingHours;
export const selectPlotAxisSigFigs = (state: RootState) =>
  state.config.plotAxisSigFigs;
export const selectDataTypes = (state: RootState) => state.config.dataTypes;

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

    dispatch(loadInitialChannelsSetting(settingsResult['initialChannels']));

    if (settingsResult['pluginHost'] !== undefined) {
      dispatch(loadPluginHostSetting(settingsResult['pluginHost']));
    }

    if (settingsResult['workingHours'] !== undefined) {
      dispatch(loadWorkingHoursSetting(settingsResult['workingHours']));
    }

    if (settingsResult['plotAxisSigFigs'] !== undefined) {
      dispatch(loadPlotAxisSigFigsSetting(settingsResult['plotAxisSigFigs']));
    }

    const dataTypes = settingsResult['dataTypes'];
    // if data types are defined, initialise everything to do with data types properly
    if (Array.isArray(dataTypes) && dataTypes.length > 0) {
      dispatch(loadDataTypesSetting(dataTypes));
      // change active_area to read as data type
      staticChannels['active_area'].name = 'Data Type';
      columnIconMappings.set('active_area', <Category />);
      // set type of shot number channel to string
      staticChannels['shotnum'].type = 'string';
    }

    dispatch(settingsLoaded());
  }
};

export default configSlice.reducer;
