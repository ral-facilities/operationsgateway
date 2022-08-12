import React from 'react';
import PlotList from './plotList.component';
import { PreloadedState } from '@reduxjs/toolkit';
import { renderWithStore, getInitialState } from '../setupTests';
import { RootState } from '../state/store';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Plot Settings component', () => {
  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderWithStore(<PlotList />, {
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

  it('creates a plot when user clicks create a plot button', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Create a plot' }));

    expect(screen.getByText('Untitled 1')).toBeVisible();
  });

  it('deletes a plot when user clicks delete button', async () => {
    state.plots = {
      'Plot 1': { open: false },
    };
    const user = userEvent.setup();
    createView();

    expect(screen.getByText('Plot 1')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Plot 1')).not.toBeInTheDocument();
  });

  it('opens a plot when user clicks open button', async () => {
    state.plots = {
      'Plot 1': { open: false },
    };
    const user = userEvent.setup();
    const { store } = createView();

    expect(screen.getByText('Plot 1')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(store.getState().plots['Plot 1']?.open).toBe(true);
  });
});
