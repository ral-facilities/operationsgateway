import PlotReducer, {
  initialState,
  createPlot,
  closePlot,
  savePlot,
  PlotConfig,
} from './plotSlice';
import { testPlotConfigs } from '../../setupTests';
import { COLOUR_ORDER } from '../../plotting/plotSettings/colourGenerator';

describe('plotSlice', () => {
  describe('Reducer', () => {
    let state: typeof initialState;

    beforeEach(() => {
      state = initialState;
    });

    it('createPlot handles assigning an untitled name correctly & creates a plot with the default options', () => {
      state = {
        'Untitled 1': { ...testPlotConfigs[0], title: 'Untitled 1' },
        'Custom plot name': {
          ...testPlotConfigs[1],
          title: 'Custom plot name',
        },
        'Untitled 3': { ...testPlotConfigs[2], title: 'Untitled 3' },
      };
      state = PlotReducer(state, createPlot());
      expect(state).toEqual({
        'Untitled 1': { ...testPlotConfigs[0], title: 'Untitled 1' },
        'Custom plot name': {
          ...testPlotConfigs[1],
          title: 'Custom plot name',
        },
        'Untitled 3': { ...testPlotConfigs[2], title: 'Untitled 3' },
        'Untitled 2': {
          open: true,
          title: 'Untitled 2',
          plotType: 'scatter',
          XAxisScale: 'linear',
          selectedPlotChannels: [],
          YAxesScale: 'linear',
          gridVisible: true,
          axesLabelsVisible: true,
          selectedColours: [],
          remainingColours: COLOUR_ORDER.map((colour) => colour),
        } as PlotConfig,
      });
    });

    it('closePlot sets the open property to false', () => {
      state = {
        [testPlotConfigs[0].title]: testPlotConfigs[0],
      };
      state = PlotReducer(state, closePlot(testPlotConfigs[0].title));
      expect(state).toEqual({
        [testPlotConfigs[0].title]: { ...testPlotConfigs[0], open: false },
      });
    });

    it('savePlot sets the config for a specified plot', () => {
      const copiedConfig = { ...testPlotConfigs[0] };
      state = {
        [testPlotConfigs[0].title]: testPlotConfigs[0],
      };
      state = PlotReducer(
        state,
        savePlot({ ...copiedConfig, plotType: 'line' })
      );
      expect(state).toEqual({
        [testPlotConfigs[0].title]: { ...copiedConfig, plotType: 'line' },
      });
    });

    it('savePlot sets a new plot config for a renamed plot', () => {
      state = {
        [testPlotConfigs[0].title]: testPlotConfigs[0],
      };
      state = PlotReducer(
        state,
        savePlot({ ...testPlotConfigs[0], title: 'My named plot' })
      );
      expect(state).toEqual({
        [testPlotConfigs[0].title]: testPlotConfigs[0],
        'My named plot': { ...testPlotConfigs[0], title: 'My named plot' },
      });
    });

    // Other actions are tested within components
  });
});
