import React from 'react';
import OpenWindows from './openWindows.component';
import {
  getInitialState,
  renderComponentWithStore,
  testPlotConfigs,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';
import { DEFAULT_WINDOW_VARS } from '../app.types';

// need to mock to avoid errors
jest.mock('../plotting/plotWindow.component', () => (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-plotWindow data-testid="mock-plotWindow">
    {Object.entries(props).map(
      ([propName, propValue]) =>
        `${propName}=${JSON.stringify(propValue, null, 2)}\n`
    )}
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
    {/* @ts-ignore */}
  </mock-plotWindow>
));

// need to mock to avoid errors
jest.mock('../traces/traceWindow.component', () => (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-traceWindow data-testid="mock-traceWindow">
    {Object.entries(props).map(
      ([propName, propValue]) =>
        `${propName}=${JSON.stringify(propValue, null, 2)}\n`
    )}
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
    {/* @ts-ignore */}
  </mock-traceWindow>
));

describe('Open Windows component', () => {
  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderComponentWithStore(<OpenWindows />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    state = getInitialState();
  });

  it('renders windows for each open window', async () => {
    state.plots = {
      [testPlotConfigs[0].title]: testPlotConfigs[0],
      [testPlotConfigs[1].title]: testPlotConfigs[1],
      [testPlotConfigs[2].title]: testPlotConfigs[2],
    };
    state.windows = {
      'Trace TEST 1': {
        open: true,
        type: 'trace',
        recordId: '1',
        channelName: 'TEST',
        title: 'Trace TEST 1',
        ...DEFAULT_WINDOW_VARS,
      },
    };
    const view = createView();

    // We expect Plot 0 and Plot 2 to be in the screenshot. Plot 1 has open: false
    expect(view.asFragment()).toMatchSnapshot();
  });
});
