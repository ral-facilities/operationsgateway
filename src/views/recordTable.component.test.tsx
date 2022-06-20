import React from 'react';
import { render, RenderResult, screen, act } from '@testing-library/react';
import RecordTable, { RecordTableProps } from './recordTable.component';
import { flushPromises, testRecords } from '../setupTests';
import { useRecordCount, useRecordsPaginated } from '../api/records';

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
    data = testRecords;
    props = {
      resultsPerPage: 10,
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
    jest.clearAllMocks();
  });

  it('renders correctly with no displayed columns', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with columns displayed', async () => {
    const columns = ['id', 'shotNum', 'timestamp', 'test1', 'test2', 'test3'];
    const view = createView();

    // Query for each column
    for (let column of columns) {
      await act(async () => {
        screen.getByLabelText(`${column} checkbox`).click();
        await flushPromises();
      });
    }

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    createView();

    expect(useRecordsPaginated).toHaveBeenCalledWith({
      page: 0,
      sort: {},
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
    });
  });

  it('updates sort query parameter on sort', async () => {
    createView();

    screen.getByLabelText('id checkbox').click();

    await act(async () => {
      screen.getByTestId('sort id').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {
        id: 'asc',
      },
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
    });

    await act(async () => {
      screen.getByTestId('sort id').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {},
    });
  });

  it.todo('updates available columns when data from backend changes');
});
