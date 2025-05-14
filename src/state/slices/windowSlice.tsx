import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_WINDOW_VARS, WindowConfig } from '../../app.types';
import { RootState } from '../store';

type WindowType = 'image' | 'trace' | 'float_image' | 'vector';

interface BaseWindowConfig extends WindowConfig {
  type: WindowType;
  recordId: string;
  channelName: string;
}

interface ImageWindow extends BaseWindowConfig {
  type: 'image';
  bitDepth?: number;
}

interface FloatImageWindow extends BaseWindowConfig {
  type: 'float_image';
}

interface TraceWindow extends BaseWindowConfig {
  type: 'trace';
}

interface VectorWindow extends BaseWindowConfig {
  type: 'vector';
  labels?: string[];
  units?: string;
}

export type WindowConfigType =
  | ImageWindow
  | TraceWindow
  | FloatImageWindow
  | VectorWindow;

// Define a type for the slice state
interface WindowState {
  [title: string]: WindowConfigType;
}

// Define the initial state using that type
export const initialState: WindowState = {};

export const windowSlice = createSlice({
  name: 'windows',
  initialState,
  reducers: {
    closeWindow: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
    openTraceWindow: (
      state,
      action: PayloadAction<{ recordId: string; channelName: string }>
    ) => {
      const { recordId, channelName } = action.payload;
      const id = crypto.randomUUID();
      state[id] = {
        id: id,
        open: true,
        type: 'trace',
        recordId,
        channelName,
        title: `Trace ${channelName} ${recordId}`,
        ...DEFAULT_WINDOW_VARS,
      };
    },
    openImageWindow: (
      state,
      action: PayloadAction<{
        recordId: string;
        channelName: string;
        bitDepth?: number;
        isFloat?: boolean;
      }>
    ) => {
      const {
        recordId,
        channelName,
        bitDepth,
        isFloat = false,
      } = action.payload;
      const id = crypto.randomUUID();
      state[id] = {
        id: id,
        open: true,
        type: isFloat ? 'float_image' : 'image',
        recordId,
        channelName,
        bitDepth,
        title: `Image ${channelName} ${recordId}`,
        ...DEFAULT_WINDOW_VARS,
      };
    },
    openVectorWindow: (
      state,
      action: PayloadAction<{
        recordId: string;
        channelName: string;
        labels?: string[];
        units?: string;
      }>
    ) => {
      const { recordId, channelName, labels, units } = action.payload;
      const id = crypto.randomUUID();
      state[id] = {
        id: id,
        open: true,
        type: 'vector',
        recordId,
        channelName,
        labels: labels,
        units: units,
        title: `Vector ${channelName} ${recordId}`,
        ...DEFAULT_WINDOW_VARS,
      };
    },
    updateWindow: (state, action: PayloadAction<WindowConfigType>) => {
      const windowConfig = action.payload;
      state[windowConfig.id] = windowConfig;
    },
  },
});

export const {
  openTraceWindow,
  openImageWindow,
  openVectorWindow,
  closeWindow,
  updateWindow,
} = windowSlice.actions;

export const selectWindows = (state: RootState) => state.windows;
export const selectTraceWindows = createSelector(selectWindows, (windows) =>
  Object.values(windows).filter((windows) => windows.type === 'trace')
);
export const selectImageWindows = createSelector(selectWindows, (windows) =>
  Object.values(windows).filter(
    (windows) => windows.type === 'image' || windows.type === 'float_image'
  )
);
export const selectVectorWindows = createSelector(selectWindows, (windows) =>
  Object.values(windows).filter((windows) => windows.type === 'vector')
);

export default windowSlice.reducer;
