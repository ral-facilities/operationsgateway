import PlotReducer, {
  initialState,
  createPlot,
  closePlot,
  savePlot,
  PlotConfig,
} from './plotSlice';
import { testPlotConfigs } from '../../setupTests';
import { COLOUR_ORDER } from '../../plotting/plotSettings/colourGenerator';
import { DEFAULT_WINDOW_VARS } from '../../app.types';

describe('plotSlice', () => {
  describe('Reducer', () => {
    let state: typeof initialState;
    let uuidCount = 0;

    beforeEach(() => {
      state = initialState;

      jest
        .spyOn(global.crypto, 'randomUUID')
        .mockImplementation(() => `${++uuidCount}`);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('createPlot handles assigning an untitled name correctly & creates a plot with the default options', () => {
      state = {
        [testPlotConfigs[0].id]: { ...testPlotConfigs[0], title: 'Untitled 1' },
        [testPlotConfigs[1].id]: {
          ...testPlotConfigs[1],
          title: 'Custom plot name',
        },
        [testPlotConfigs[2].id]: { ...testPlotConfigs[2], title: 'Untitled 3' },
      };
      state = PlotReducer(state, createPlot());
      expect(state).toEqual({
        [testPlotConfigs[0].id]: { ...testPlotConfigs[0], title: 'Untitled 1' },
        [testPlotConfigs[1].id]: {
          ...testPlotConfigs[1],
          title: 'Custom plot name',
        },
        [testPlotConfigs[2].id]: { ...testPlotConfigs[2], title: 'Untitled 3' },
        [uuidCount]: {
          id: `${uuidCount}`,
          open: true,
          title: 'Untitled 2',
          plotType: 'scatter',
          XAxis: 'timestamp',
          XAxisScale: 'time',
          selectedPlotChannels: [],
          leftYAxisScale: 'linear',
          rightYAxisScale: 'linear',
          gridVisible: true,
          axesLabelsVisible: true,
          selectedColours: [],
          remainingColours: COLOUR_ORDER.map((colour) => colour),
          ...DEFAULT_WINDOW_VARS,
        } satisfies PlotConfig,
      });
    });

    it('closePlot sets the open property to false', () => {
      state = {
        [testPlotConfigs[0].id]: testPlotConfigs[0],
      };
      state = PlotReducer(state, closePlot(testPlotConfigs[0].id));
      expect(state).toEqual({
        [testPlotConfigs[0].id]: { ...testPlotConfigs[0], open: false },
      });
    });

    it('savePlot sets the config for a specified plot', () => {
      const copiedConfig = { ...testPlotConfigs[0] };
      state = {
        [testPlotConfigs[0].id]: testPlotConfigs[0],
      };
      state = PlotReducer(
        state,
        savePlot({ ...copiedConfig, plotType: 'line' })
      );
      expect(state).toEqual({
        [testPlotConfigs[0].id]: { ...copiedConfig, plotType: 'line' },
      });
    });

    it('savePlot updates existing config for a renamed plot', () => {
      state = {
        [testPlotConfigs[0].id]: testPlotConfigs[0],
      };
      state = PlotReducer(
        state,
        savePlot({ ...testPlotConfigs[0], title: 'My named plot' })
      );
      expect(state).toEqual({
        [testPlotConfigs[0].id]: {
          ...testPlotConfigs[0],
          title: 'My named plot',
        },
      });
    });

    // Other actions are tested within components
  });
});
