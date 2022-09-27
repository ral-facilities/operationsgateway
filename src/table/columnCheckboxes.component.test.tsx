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
      systemName: 'name',
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
      screen.getByLabelText('name checkbox').click();
      await flushPromises();
    });

    expect(store.getState().table.selectedColumnIds).toEqual(['name']);
  });

  it('calls onColumnClose when checkbox is unchecked', async () => {
    state.table.selectedColumnIds = availableChannels.map(
      (channel) => channel.systemName
    );
    const { store } = createView();
    await act(async () => {
      screen.getByLabelText('name checkbox').click();
      await flushPromises();
    });
    expect(store.getState().table.selectedColumnIds).toEqual(
      availableChannels
        .filter((channel) => channel.systemName !== 'name')
        .map((channel) => channel.systemName)
    );
  });

  it.todo('calls onChecked when checkbox is clicked via shift-click');
});
