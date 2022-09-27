import React from 'react';
import RecordTable from './recordTable.component';
import {
  screen,
  act,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  flushPromises,
  getInitialState,
  renderComponentWithStore,
  testRecordRows,
  testChannels,
  generateRecordRow,
} from '../setupTests';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import userEvent from '@testing-library/user-event';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';
import {
  useAvailableColumns,
  constructColumns,
  useChannels,
} from '../api/channels';
import { selectColumn, deselectColumn } from '../state/slices/tableSlice';

jest.mock('../api/records', () => {
  const originalModule = jest.requireActual('../api/records');

  return {
    __esModule: true,
    ...originalModule,
    useRecordsPaginated: jest.fn(),
    useRecordCount: jest.fn(),
  };
});

jest.mock('../api/channels', () => {
  const originalModule = jest.requireActual('../api/channels');

  return {
    __esModule: true,
    ...originalModule,
    useChannels: jest.fn(),
    useAvailableColumns: jest.fn(),
  };
});

describe('Record Table', () => {
  let data;
  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderComponentWithStore(<RecordTable />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    applyDatePickerWorkaround();
    userEvent.setup();
    data = testRecordRows;

    (useRecordsPaginated as jest.Mock).mockReturnValue({
      data: data,
      isLoading: false,
    });
    (useRecordCount as jest.Mock).mockReturnValue({
      data: data.length,
      isLoading: false,
    });
    (useChannels as jest.Mock).mockReturnValue({
      data: testChannels,
      isLoading: false,
    });
    (useAvailableColumns as jest.Mock).mockReturnValue({
      data: constructColumns(testChannels),
      isLoading: false,
    });

    state = getInitialState();
  });

  afterEach(() => {
    cleanupDatePickerWorkaround();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly while loading', () => {
    (useRecordsPaginated as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });

    (useRecordCount as jest.Mock).mockReturnValue({
      isLoading: true,
    });

    (useAvailableColumns as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });

    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly while data count is zero', () => {
    (useRecordsPaginated as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useRecordCount as jest.Mock).mockReturnValue({
      data: 0,
      isLoading: false,
    });

    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    createView();

    expect(useRecordsPaginated).toHaveBeenCalled();
    expect(useRecordCount).toHaveBeenCalled();
    expect(useAvailableColumns).toHaveBeenCalled();
  });

  it('can sort columns and removes column sort when column is closed', async () => {
    const user = userEvent.setup();
    const { store } = createView({
      table: { ...state.table, selectedColumnIds: ['timestamp', 'shotnum'] },
    });

    await user.click(screen.getByTestId('sort shotnum'));

    await act(async () => {
      await flushPromises();
    });

    expect(screen.getByTestId('sort shotnum')).toHaveClass('Mui-active');

    const menuIcon = screen.getByLabelText('shotnum menu');
    fireEvent.click(menuIcon);

    const close = screen.getByText('Close');
    fireEvent.click(close);

    await waitFor(() => {
      expect(screen.queryByTestId('sort shotnum')).not.toBeInTheDocument();
    });

    act(() => {
      store.dispatch(selectColumn('shotnum'));
    });

    expect(screen.getByTestId('sort shotnum')).not.toHaveClass('Mui-active');
  });

  it('paginates correctly', async () => {
    state = { ...state, table: { ...state.table, resultsPerPage: 10 } };
    data = Array.from(Array(12), (_, i) => generateRecordRow(i + 1));
    (useRecordsPaginated as jest.Mock).mockReturnValue({
      data,
      isLoading: false,
    });
    (useRecordCount as jest.Mock).mockReturnValue({
      data: data.length,
      isLoading: false,
    });
    const user = userEvent.setup();
    createView();

    screen.getByText(`1–10 of ${data.length}`);

    await user.click(screen.getByLabelText('Go to next page'));

    screen.getByText(`11–12 of ${data.length}`);

    const resultsPerPage = screen.getByRole('button', {
      name: /Rows per page/i,
    });
    await user.click(resultsPerPage);

    const listbox = within(screen.getByRole('listbox'));

    await user.click(listbox.getByText('25'));

    screen.getByText(`1–12 of ${data.length}`);
  });

  it('adds columns in correct order on checkbox click', () => {
    const { store } = createView();

    act(() => {
      store.dispatch(selectColumn('shotnum'));
      store.dispatch(selectColumn('activeArea'));
      store.dispatch(selectColumn('activeExperiment'));
    });

    let columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(4);
    expect(columns[0]).toHaveTextContent('Timestamp');
    expect(columns[1]).toHaveTextContent('Shot Number');
    expect(columns[2]).toHaveTextContent('Active Area');
    expect(columns[3]).toHaveTextContent('Active Experiment');

    // Remove middle column
    act(() => {
      store.dispatch(deselectColumn('activeArea'));
    });

    columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(3);
    expect(columns[0]).toHaveTextContent('Timestamp');
    expect(columns[1]).toHaveTextContent('Shot Number');
    expect(columns[2]).toHaveTextContent('Active Experiment');

    act(() => {
      store.dispatch(selectColumn('activeArea'));
    });

    // Should expect the column previously in the middle to now be on the end
    columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(4);
    expect(columns[0]).toHaveTextContent('Timestamp');
    expect(columns[1]).toHaveTextContent('Shot Number');
    expect(columns[2]).toHaveTextContent('Active Experiment');
    expect(columns[3]).toHaveTextContent('Active Area');
  });

  it('rounds numbers correctly in scalar columns', async () => {
    createView({
      table: { ...state.table, selectedColumnIds: ['timestamp', 'test_3'] },
    });

    await act(async () => {
      await flushPromises();
    });

    expect(screen.getByText('3.3e+2')).toBeInTheDocument();
  });

  it("updates columns when a column's word wrap is toggled", async () => {
    createView();

    let menuIcon = screen.getByLabelText('timestamp menu');
    fireEvent.click(menuIcon);

    expect(screen.getByText('Turn word wrap on')).toBeInTheDocument();

    const wordWrap = screen.getByText('Turn word wrap on');
    fireEvent.click(wordWrap);

    menuIcon = screen.getByLabelText('timestamp menu');
    fireEvent.click(menuIcon);

    expect(screen.getByText('Turn word wrap off')).toBeInTheDocument();
  });

  it.todo('updates available columns when data from backend changes');
});
