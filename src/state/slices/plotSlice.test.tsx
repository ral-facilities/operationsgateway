import PlotReducer, {
  initialState,
  createPlot,
  closePlot,
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
        'Untitled 1': testPlotConfigs[0],
        'Custom plot name': testPlotConfigs[1],
        'Untitled 3': testPlotConfigs[2],
      };
      state = PlotReducer(state, createPlot());
      expect(state).toEqual({
        'Untitled 1': testPlotConfigs[0],
        'Custom plot name': testPlotConfigs[1],
        'Untitled 3': testPlotConfigs[2],
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
        'Untitled 1': testPlotConfigs[0],
      };
      state = PlotReducer(state, closePlot('Untitled 1'));
      expect(state).toEqual({
        'Untitled 1': { ...testPlotConfigs[0], open: false },
      });
    });

    // Other actions are tested within components
  });
});
