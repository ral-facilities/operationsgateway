import React from 'react';
import PlotGrid from './plotGrid.component';
import { PreloadedState } from '@reduxjs/toolkit';
import { renderWithStore, getInitialState } from '../setupTests';
import { RootState } from '../state/store';

describe('Plot Settings component', () => {
  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderWithStore(<PlotGrid />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    state = getInitialState();
  });

  it('renders plot grid correctly with no plots', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders plot grid correctly with some plots', () => {
    state.plots = {
      'Plot 1': { open: true },
      'Plot 2': { open: false },
      'Plot 3': { open: true },
    };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
