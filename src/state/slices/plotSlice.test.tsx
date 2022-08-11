import PlotReducer, { initialState, createPlot, closePlot } from './plotSlice';

describe('plotSlice', () => {
  // only test the hard to test bits of columnSlice here - like column reordering logic
  describe('Reducer', () => {
    let state: typeof initialState;

    beforeEach(() => {
      state = initialState;
    });

    it('createPlot handles assigning an untitled name correctly & creates a plot with the default options', () => {
      state = {
        'Untitled 1': { open: true },
        'Custom plot name': { open: true },
        'Untitled 3': { open: false },
      };
      state = PlotReducer(state, createPlot());
      expect(state).toEqual({
        'Untitled 1': { open: true },
        'Custom plot name': { open: true },
        'Untitled 3': { open: false },
        'Untitled 2': { open: true },
      });
    });

    it('closePlot sets the open property to false', () => {
      state = {
        'Untitled 1': { open: true },
      };
      state = PlotReducer(state, closePlot('Untitled 1'));
      expect(state).toEqual({
        'Untitled 1': { open: false },
      });
    });

    // Other actions are tested within components
  });
});
