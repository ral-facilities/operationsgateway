import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_WINDOW_VARS, WindowConfig } from '../../app.types';
import { RootState } from '../store';

type WindowType = 'image' | 'trace';
export interface TraceOrImageWindow extends WindowConfig {
  type: WindowType;
  recordId: string;
  channelName: string;
}

// Define a type for the slice state
interface WindowState {
  [title: string]: TraceOrImageWindow;
}

// export function uuidv4() {
//   // could use crypto.randomUUID instead
//   return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
//     (
//       c ^
//       (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
//     ).toString(16)
//   );
// }

// Define the initial state using that type
export const initialState: WindowState = {};

export const windowSlice = createSlice({
  name: 'windows',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
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
      action: PayloadAction<{ recordId: string; channelName: string }>
    ) => {
      const { recordId, channelName } = action.payload;
      const id = crypto.randomUUID();
      state[id] = {
        id: id,
        open: true,
        type: 'image',
        recordId,
        channelName,
        title: `Image ${channelName} ${recordId}`,
        ...DEFAULT_WINDOW_VARS,
      };
    },
    updateWindow: (state, action: PayloadAction<TraceOrImageWindow>) => {
      const windowConfig = action.payload;
      state[windowConfig.id] = windowConfig;
    },
  },
});

export const { openTraceWindow, openImageWindow, closeWindow, updateWindow } =
  windowSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectWindows = (state: RootState) => state.windows;
export const selectTraceWindows = createSelector(selectWindows, (windows) =>
  Object.values(windows).filter((windows) => windows.type === 'trace')
);
export const selectImageWindows = createSelector(selectWindows, (windows) =>
  Object.values(windows).filter((windows) => windows.type === 'image')
);

export default windowSlice.reducer;
