import { renderHook } from '@testing-library/react';
import React from 'react';
import { useUpdateWindowPositions } from './hooks';
import { RootState } from './state/store';
import { getInitialState } from './testUtils';
import { WindowContext, WindowsRefType } from './windows/windowContext';

const windowsRef: React.MutableRefObject<WindowsRefType | null> =
  React.createRef();
windowsRef.current = {};

export const useUpdateWindowPositionsProviders = () => {
  const wrapper = ({ children }) => (
    <WindowContext.Provider value={windowsRef}>
      {children}
    </WindowContext.Provider>
  );
  return wrapper;
};

describe('Hooks', () => {
  describe('useUpdateWindowPositions', () => {
    let state: RootState;

    beforeEach(() => {
      state = getInitialState();
    });

    it('returns function which when called with state, loads windows from context and returns updated redux state', () => {
      const imageWindowRef = React.createRef();
      imageWindowRef.current = {
        state: {
          window: {
            innerWidth: 1,
            innerHeight: 2,
            screenX: 3,
            screenY: 4,
          },
        },
      };
      const imageWindow2Ref = React.createRef();
      imageWindow2Ref.current = {
        state: {
          window: {},
        },
      };
      const traceWindowRef = React.createRef();
      traceWindowRef.current = {
        state: {
          window: {
            innerWidth: 5,
            innerHeight: 6,
            screenX: 7,
            screenY: 8,
          },
        },
      };
      const plotWindowRef = React.createRef();
      plotWindowRef.current = {
        state: {
          window: {
            innerWidth: 9,
            innerHeight: 10,
            screenX: 11,
            screenY: 12,
          },
        },
      };
      const plotWindow2Ref = React.createRef();
      plotWindow2Ref.current = {
        state: {
          window: {},
        },
      };
      windowsRef.current = {
        imageWindow: imageWindowRef,
        traceWindow: traceWindowRef,
        plotWindow: plotWindowRef,
        imageWindow2: imageWindow2Ref,
        plotWindow2: plotWindow2Ref,
      };
      const windows = {
        imageWindow: {
          type: 'image',
          recordId: 'test',
          channelName: 'test',
          id: 'imageWindow',
          open: true,
          title: 'Image Window',
          innerWidth: 0,
          innerHeight: 0,
          screenX: 0,
          screenY: 0,
        },
        imageWindow2: {
          type: 'image',
          recordId: 'test',
          channelName: 'test',
          id: 'imageWindow2',
          open: true,
          title: 'Image Window',
          innerWidth: 0,
          innerHeight: 0,
          screenX: 0,
          screenY: 0,
        },
        traceWindow: {
          type: 'trace',
          recordId: 'test2',
          channelName: 'test2',
          id: 'traceWindow',
          open: true,
          title: 'Trace Window',
          innerWidth: 0,
          innerHeight: 0,
          screenX: 0,
          screenY: 0,
        },
        traceWindow2: {
          type: 'trace',
          recordId: 'test2',
          channelName: 'test2',
          id: 'traceWindow2',
          open: true,
          title: 'Trace Window',
          innerWidth: 0,
          innerHeight: 0,
          screenX: 0,
          screenY: 0,
        },
      };
      state.windows = windows;
      const plots = {
        plotWindow: {
          plotType: 'line',
          XAxisScale: 'time',
          selectedPlotChannels: [],
          leftYAxisScale: 'linear',
          rightYAxisScale: 'linear',
          gridVisible: false,
          axesLabelsVisible: false,
          selectedColours: [],
          remainingColours: [],
          id: 'plotWindow',
          open: true,
          title: '',
          innerWidth: 0,
          innerHeight: 0,
          screenX: 0,
          screenY: 0,
        },
        plotWindow2: {
          plotType: 'line',
          XAxisScale: 'time',
          selectedPlotChannels: [],
          leftYAxisScale: 'linear',
          rightYAxisScale: 'linear',
          gridVisible: false,
          axesLabelsVisible: false,
          selectedColours: [],
          remainingColours: [],
          id: 'plotWindow2',
          open: true,
          title: '',
          innerWidth: 0,
          innerHeight: 0,
          screenX: 0,
          screenY: 0,
        },
        plotWindow3: {
          plotType: 'line',
          XAxisScale: 'time',
          selectedPlotChannels: [],
          leftYAxisScale: 'linear',
          rightYAxisScale: 'linear',
          gridVisible: false,
          axesLabelsVisible: false,
          selectedColours: [],
          remainingColours: [],
          id: 'plotWindow3',
          open: true,
          title: '',
          innerWidth: 0,
          innerHeight: 0,
          screenX: 0,
          screenY: 0,
        },
      };
      state.plots = plots;

      const { result } = renderHook(() => useUpdateWindowPositions(), {
        wrapper: useUpdateWindowPositionsProviders(),
      });

      const updatedState = result.current(state);

      const updatedWindows = {
        ...windows,
        imageWindow: {
          ...windows.imageWindow,
          innerWidth: 1,
          innerHeight: 2,
          screenX: 3,
          screenY: 4,
        },
        traceWindow: {
          ...windows.traceWindow,
          innerWidth: 5,
          innerHeight: 6,
          screenX: 7,
          screenY: 8,
        },
      };
      expect(updatedState.windows).toStrictEqual(updatedWindows);

      const updatedPlots = {
        ...plots,
        plotWindow: {
          ...plots.plotWindow,
          innerWidth: 9,
          innerHeight: 10,
          screenX: 11,
          screenY: 12,
        },
      };
      expect(updatedState.plots).toStrictEqual(updatedPlots);
    });
  });
});
