import React from 'react';
import { render, RenderResult, screen, act } from '@testing-library/react';
import RecordTable, { RecordTableProps } from './recordTable.component';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  flushPromises,
  testRecords,
} from '../setupTests';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import userEvent from '@testing-library/user-event';

jest.mock('../api/records', () => {
  const originalModule = jest.requireActual('../api/records');

  return {
    __esModule: true,
    ...originalModule,
    useRecordsPaginated: jest.fn(),
    useRecordCount: jest.fn(),
  };
});

describe('Record Table', () => {
  let data;
  let props: RecordTableProps;

  const createView = (): RenderResult => {
    return render(<RecordTable {...props} />);
  };

  beforeEach(() => {
    applyDatePickerWorkaround();
    userEvent.setup();
    data = testRecords;
    props = {
      resultsPerPage: 25,
    };

    (useRecordsPaginated as jest.Mock).mockReturnValue({
      data: data,
      isLoading: false,
    });
    (useRecordCount as jest.Mock).mockReturnValue({
      data: data.length,
      isLoading: false,
    });
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

    expect(useRecordsPaginated).toHaveBeenCalledWith({
      page: 0,
      sort: {},
      startDateRange: {},
      endDateRange: {},
    });
    expect(useRecordCount).toHaveBeenCalled();
  });

  it('updates page query parameter on page change', async () => {
    props.resultsPerPage = 1;
    createView();

    await act(async () => {
      screen.getByLabelText('Go to next page').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 1,
      sort: {},
      startDateRange: {},
      endDateRange: {},
    });
  });

  it('updates sort query parameter on sort', async () => {
    createView();

    await act(async () => {
      screen.getByTestId('sort id').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {
        id: 'asc',
      },
      startDateRange: {},
      endDateRange: {},
    });

    await act(async () => {
      screen.getByTestId('sort id').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {
        id: 'desc',
      },
      startDateRange: {},
      endDateRange: {},
    });

    await act(async () => {
      screen.getByTestId('sort id').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {},
      startDateRange: {},
      endDateRange: {},
    });
  });

  it('updates start/end date fields on date-time change', async () => {
    createView();

    const startDateFilterFromDate = screen.getByLabelText(
      'startDateFilter from, date-time input'
    );
    await userEvent.type(startDateFilterFromDate, '2022-01-01 00:00:00');

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {},
      startDateRange: {
        fromDate: '2022-01-01 00:00:00',
      },
      endDateRange: {},
    });

    const startDateFilterToDate = screen.getByLabelText(
      'startDateFilter to, date-time input'
    );
    await userEvent.type(startDateFilterToDate, '2022-01-02 00:00:00');

    const endDateFilterFromDate = screen.getByLabelText(
      'endDateFilter from, date-time input'
    );
    await userEvent.type(endDateFilterFromDate, '2022-01-03 00:00:00');

    const endDateFilterToDate = screen.getByLabelText(
      'endDateFilter to, date-time input'
    );
    await userEvent.type(endDateFilterToDate, '2022-01-04 00:00:00');

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {},
      startDateRange: {
        fromDate: '2022-01-01 00:00:00',
        toDate: '2022-01-02 00:00:00',
      },
      endDateRange: {
        fromDate: '2022-01-03 00:00:00',
        toDate: '2022-01-04 00:00:00',
      },
    });
  });

  it.todo('updates available columns when data from backend changes');
});
