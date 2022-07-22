import React from 'react';
import { Column } from 'react-table';
import ColumnCheckboxes from './columnCheckboxes.component';
import { screen, act } from '@testing-library/react';
import { flushPromises, getState, renderWithProviders } from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

describe('Column Checkboxes', () => {
  const columnDefs: { [id: string]: Column } = {
    name: {
      Header: 'Name',
      accessor: 'name',
    },
    activeArea: {
      Header: 'Active Area',
      accessor: 'activeArea',
    },
    activeExperiment: {
      Header: 'Active Experiment',
      accessor: 'activeExperiment',
    },
  };

  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderWithProviders(<ColumnCheckboxes />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    state = { ...getState(), columns: { ...getState().columns, columnDefs } };
  });

  it('renders correctly when unchecked', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when checked', () => {
    state.columns.selectedColumnIds = Object.keys(columnDefs);
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('does not render a timestamp checkbox if a timestamp column exists', () => {
    const amendedColumnDefs = {
      ...columnDefs,
      timestamp: {
        Header: 'Timestamp',
        accessor: 'timestamp',
      },
    };
    state.columns.columnDefs = amendedColumnDefs;

    createView();
    expect(screen.queryByLabelText('timestamp checkbox')).toBeNull();
  });

  it('sends selectColumn when checkbox is checked', async () => {
    const { store } = createView();
    await act(async () => {
      screen.getByLabelText('name checkbox').click();
      await flushPromises();
    });

    expect(store.getState().columns.selectedColumnIds).toEqual(['name']);
  });

  it('calls onColumnClose when checkbox is unchecked', async () => {
    state.columns.selectedColumnIds = Object.keys(columnDefs);
    const { store } = createView();
    await act(async () => {
      screen.getByLabelText('name checkbox').click();
      await flushPromises();
    });
    expect(store.getState().columns.selectedColumnIds).toEqual(
      Object.keys(columnDefs).filter((id) => id !== 'name')
    );
  });

  it.todo('calls onChecked when checkbox is clicked via shift-click');
});
