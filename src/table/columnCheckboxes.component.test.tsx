import React from 'react';
import { Column } from 'react-table';
import ColumnCheckboxes, {
  ColumnCheckboxesProps,
} from './columnCheckboxes.component';
import { screen, act } from '@testing-library/react';
import {
  flushPromises,
  getInitialState,
  renderWithProviders,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

describe('Column Checkboxes', () => {
  let props: ColumnCheckboxesProps;
  const availableColumns: Column[] = [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Active Area',
      accessor: 'activeArea',
      channelInfo: {
        systemName: 'active_area',
        dataType: 'scalar',
      },
    },
    {
      Header: 'Active Experiment',
      accessor: 'activeExperiment',
      channelInfo: {
        systemName: 'activeExperiment',
        userFriendlyName: 'Active Experiment',
        dataType: 'scalar',
      },
    },
  ];

  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderWithProviders(<ColumnCheckboxes {...props} />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    state = { ...getInitialState(), table: { ...getInitialState().table } };
    props = {
      availableColumns,
    };
  });

  it('renders correctly when unchecked', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when checked', () => {
    state.table.selectedColumnIds = availableColumns.map((col) => col.accessor);
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('does not render a timestamp checkbox if a timestamp column exists', () => {
    const amendedColumns: Column[] = [
      ...availableColumns,
      {
        Header: 'Timestamp',
        accessor: 'timestamp',
      },
    ];
    props = {
      ...props,
      availableColumns: amendedColumns,
    };

    createView();
    expect(screen.queryByLabelText('timestamp checkbox')).toBeNull();
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
    state.table.selectedColumnIds = availableColumns.map((col) => col.accessor);
    const { store } = createView();
    await act(async () => {
      screen.getByLabelText('name checkbox').click();
      await flushPromises();
    });
    expect(store.getState().table.selectedColumnIds).toEqual(
      availableColumns
        .filter((col) => col.accessor !== 'name')
        .map((col) => col.accessor)
    );
  });

  it('returns null if a column is not fully defined', () => {
    availableColumns[0].accessor = undefined;

    createView();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toEqual(2);
    expect(screen.queryByText('name')).toBeNull();
  });

  it.todo('calls onChecked when checkbox is clicked via shift-click');
});
