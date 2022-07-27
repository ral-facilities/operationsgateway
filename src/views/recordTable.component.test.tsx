import React from 'react';
import RecordTable from './recordTable.component';
import { screen, act, fireEvent, within } from '@testing-library/react';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  flushPromises,
  getState,
  renderWithProviders,
  testRecordRows,
  testChannels,
  generateRecordRow,
} from '../setupTests';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import userEvent from '@testing-library/user-event';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';
import { useChannels } from '../api/channels';

jest.mock('../api/records', () => {
  const originalModule = jest.requireActual('../api/records');

  return {
    __esModule: true,
    ...originalModule,
    useRecordsPaginated: jest.fn(),
    useRecordCount: jest.fn(),
  };
});

jest.mock('../api/channels');

describe('Record Table', () => {
  let data;
  let channelData;
  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderWithProviders(<RecordTable />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    applyDatePickerWorkaround();
    userEvent.setup();
    data = testRecordRows;
    channelData = testChannels;

    (useRecordsPaginated as jest.Mock).mockReturnValue({
      data: data,
      isLoading: false,
    });
    (useRecordCount as jest.Mock).mockReturnValue({
      data: data.length,
      isLoading: false,
    });
    (useChannels as jest.Mock).mockReturnValue({
      data: channelData,
      isLoading: false,
    });

    state = getState();
  });

  afterEach(() => {
    cleanupDatePickerWorkaround();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const view = createView();

    const test1Checkbox = screen.getByLabelText('test_1 checkbox');
    fireEvent.click(test1Checkbox);

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

    (useChannels as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });

    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly while data count is zero', () => {
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
    expect(useChannels).toHaveBeenCalled();
  });

  it('can sort columns and removes column sort when column is closed', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByLabelText('shotNum checkbox'));
    await user.click(screen.getByTestId('sort shotNum'));

    await act(async () => {
      await flushPromises();
    });

    expect(screen.getByTestId('sort shotNum')).toHaveClass('Mui-active');

    let menuIcon = screen.getByLabelText('shotNum menu');
    fireEvent.click(menuIcon);

    const close = screen.getByText('Close');
    fireEvent.click(close);

    expect(screen.getByLabelText('shotNum checkbox')).toHaveProperty(
      'checked',
      false
    );

    await user.click(screen.getByLabelText('shotNum checkbox'));

    expect(screen.getByTestId('sort shotNum')).not.toHaveClass('Mui-active');
  });

  // TODO: this test is similar to the one in table - either we keep the redux
  // state in recordTable and do the test here - or we move the state into table
  // and do the test there
  it('paginates correctly', async () => {
    state = { ...state, columns: { ...state.columns, resultsPerPage: 10 } };
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

  it('adds columns in correct order on checkbox click', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByLabelText('shotNum checkbox'));
    await user.click(screen.getByLabelText('activeArea checkbox'));
    await user.click(screen.getByLabelText('activeExperiment checkbox'));

    let columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(4);
    expect(columns[0]).toHaveTextContent('timestamp');
    expect(columns[1]).toHaveTextContent('shotNum');
    expect(columns[2]).toHaveTextContent('activeArea');
    expect(columns[3]).toHaveTextContent('activeExperiment');

    // Remove middle column
    await user.click(screen.getByLabelText('activeArea checkbox'));

    columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(3);
    expect(columns[0]).toHaveTextContent('timestamp');
    expect(columns[1]).toHaveTextContent('shotNum');
    expect(columns[2]).toHaveTextContent('activeExperiment');

    await user.click(screen.getByLabelText('activeArea checkbox'));

    // Should expect the column previously in the middle to now be on the end
    columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(4);
    expect(columns[0]).toHaveTextContent('timestamp');
    expect(columns[1]).toHaveTextContent('shotNum');
    expect(columns[2]).toHaveTextContent('activeExperiment');
    expect(columns[3]).toHaveTextContent('activeArea');
  });

  it('rounds numbers correctly in scalar columns', async () => {
    createView();

    await act(async () => {
      screen.getByLabelText('test_3 checkbox').click();
      await flushPromises();
    });

    expect(screen.getByText('3.3e+2')).toBeInTheDocument();
  });

  it.todo('updates available columns when data from backend changes');
});
