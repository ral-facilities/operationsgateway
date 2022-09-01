import React from 'react';
import OpenPlots from './openPlots.component';
import { getInitialState, renderComponentWithStore } from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

// need to mock to avoid errors
jest.mock('./plotWindow.component', () => (props) => (
  // @ts-ignore
  <mock-PlotWindow {...props} />
));

describe('Open Plots component', () => {
  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderComponentWithStore(<OpenPlots />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    state = getInitialState();
  });

  it('renders windows for each open plot', async () => {
    state.plots = {
      'Plot 1': { open: true },
      'Plot 2': { open: false },
      'Plot 3': { open: true },
    };
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });
});
