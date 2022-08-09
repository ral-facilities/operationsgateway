import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// TODO: fill this out or move somewhere once it gets hooked up?
export interface PlotConfig {
  open: boolean;
  xAxis?: string;
  yAxes?: string[];
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
      // TODO: properly initiate the plot here
      state[newPlotTitle] = { open: true };
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    closePlot: (state, action: PayloadAction<string>) => {
      state[action.payload].open = false;
    },
    openPlot: (state, action: PayloadAction<string>) => {
      state[action.payload].open = true;
    },
    deletePlot: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { createPlot, closePlot, openPlot, deletePlot } =
  plotSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectPlots = (state: RootState) => state.plots;
export const selectOpenPlots = (state: RootState) =>
  Object.fromEntries(
    Object.entries(state.plots).filter(([plotTitle, plot]) => plot.open)
  );

export default plotSlice.reducer;
