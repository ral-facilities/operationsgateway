import React from 'react';
import ColumnCheckboxes from './columnCheckboxes.component';
import { screen, act } from '@testing-library/react';
import {
  flushPromises,
  getInitialState,
  renderComponentWithStore,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';
import { useChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';

jest.mock('../api/channels', () => {
  const originalModule = jest.requireActual('../api/channels');

  return {
    __esModule: true,
    ...originalModule,
    useChannels: jest.fn(),
  };
});

describe('Column Checkboxes', () => {
  const availableChannels: FullChannelMetadata[] = [
    {
      systemName: 'timestamp',
      channel_dtype: 'scalar',
      userFriendlyName: 'Time',
    },
    {
      systemName: 'shotnum',
      channel_dtype: 'scalar',
    },
    {
      systemName: 'activeArea',
      channel_dtype: 'scalar',
    },
    {
      systemName: 'activeExperiment',
      channel_dtype: 'scalar',
      userFriendlyName: 'Active Experiment',
    },
  ];

  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderComponentWithStore(<ColumnCheckboxes />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    state = { ...getInitialState(), table: { ...getInitialState().table } };
    (useChannels as jest.Mock).mockReturnValue({
      data: availableChannels,
      isLoading: false,
    });
  });

  it('renders correctly when unchecked', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when checked', () => {
    state.table.selectedColumnIds = availableChannels.map(
      (channel) => channel.systemName
    );
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('sends selectColumn when checkbox is checked', async () => {
    const { store } = createView();
    await act(async () => {
      screen.getByLabelText('shotnum checkbox').click();
      await flushPromises();
    });

    expect(store.getState().table.selectedColumnIds).toEqual(['shotnum']);
  });

  it('calls onColumnClose when checkbox is unchecked', async () => {
    state.table.selectedColumnIds = availableChannels.map(
      (channel) => channel.systemName
    );
    const { store } = createView();
    await act(async () => {
      screen.getByLabelText('shotnum checkbox').click();
      await flushPromises();
    });
    expect(store.getState().table.selectedColumnIds).toEqual(
      availableChannels
        .filter((channel) => channel.systemName !== 'shotnum')
        .map((channel) => channel.systemName)
    );
  });

  it('does not render a timestamp checkbox if a timestamp column exists', () => {
    createView();
    expect(screen.queryByLabelText('Time')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('timestamp')).not.toBeInTheDocument();
  });

  it.todo('calls onChecked when checkbox is clicked via shift-click');
});
