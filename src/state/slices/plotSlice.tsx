import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PlotType,
  SelectedPlotChannel,
  XAxisScale,
  YAxesScale,
} from '../../app.types';
import { RootState } from '../store';
import { COLOUR_ORDER } from '../../plotting/plotSettings/colourGenerator';

export const DEFAULT_WINDOW_VARS = {
  outerWidth: 600,
  outerHeight: 400,
  screenX: 200,
  screenY: 200,
};

export interface PlotConfig {
  open: boolean;
  title: string;
  plotType: PlotType;
  XAxis?: string;
  XAxisScale: XAxisScale;
  xMinimum?: number;
  xMaximum?: number;
  selectedPlotChannels: SelectedPlotChannel[];
  YAxesScale: YAxesScale;
  yMinimum?: number;
  yMaximum?: number;
  gridVisible: boolean;
  axesLabelsVisible: boolean;
  selectedColours: string[];
  remainingColours: string[];
  outerWidth: number;
  outerHeight: number;
  screenX: number;
  screenY: number;
}

// Define a type for the slice state
interface PlotState {
  [title: string]: PlotConfig;
}

// Define the initial state using that type
export const initialState = {} as PlotState;

export const plotSlice = createSlice({
  name: 'plots',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    createPlot: (state) => {
      const plotTitles = Object.keys(state);
      let i = 1;
      let newPlotTitle = '';
      while (true) {
        newPlotTitle = `Untitled ${i}`;
        if (!plotTitles.includes(newPlotTitle)) break;
        i++;
      }
      state[newPlotTitle] = {
        open: true,
        title: newPlotTitle,
        plotType: 'scatter',
        XAxisScale: 'linear',
        selectedPlotChannels: [],
        YAxesScale: 'linear',
        gridVisible: true,
        axesLabelsVisible: true,
        selectedColours: [],
        remainingColours: COLOUR_ORDER.map((colour) => colour),
        ...DEFAULT_WINDOW_VARS,
      };
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    closePlot: (state, action: PayloadAction<string>) => {
      state[action.payload].open = false;
    },
    openPlot: (state, action: PayloadAction<string>) => {
      state[action.payload].open = true;
    },
    savePlot: (state, action: PayloadAction<PlotConfig>) => {
      const plotConfig = action.payload;
      state[plotConfig.title] = plotConfig;
    },
    deletePlot: (state, action: PayloadAction<string>) => {
      // TODO check here if the plot is open first. Otherwise, an error is printed in console
      delete state[action.payload];
    },
  },
});

export const { createPlot, closePlot, openPlot, savePlot, deletePlot } =
  plotSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectPlots = (state: RootState) => state.plots;
export const selectOpenPlots = (state: RootState) =>
  Object.fromEntries(
    Object.entries(state.plots).filter(([plotTitle, plot]) => plot.open)
  );

export default plotSlice.reducer;
