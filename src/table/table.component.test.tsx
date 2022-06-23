import React from 'react';
import Table, { TableProps } from './table.component';
import {
  render,
  RenderResult,
  screen,
  cleanup,
  act,
} from '@testing-library/react';
import { RecordRow } from '../app.types';
import { Column } from 'react-table';
import { flushPromises } from '../setupTests';

describe('Table', () => {
  let props: TableProps;
  const recordRows: RecordRow[] = [
    {
      id: 'test1',
      shotNum: 1,
      timestamp: new Date('2022-01-01T00:00:00Z').getTime().toString(),
    },
    {
      id: 'test2',
      shotNum: 2,
      timestamp: new Date('2022-01-02T00:00:00Z').getTime().toString(),
    },
    {
      id: 'test3',
      shotNum: 3,
      timestamp: new Date('2022-01-03T00:00:00Z').getTime().toString(),
    },
  ];
  const availableColumns: Column[] = [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Shot Number',
      accessor: 'shotNum',
    },
    {
      Header: 'Timestamp',
      accessor: 'timestamp',
    },
  ];
  const onPageChange = jest.fn();
  const onSort = jest.fn();

  const createView = (): RenderResult => {
    return render(<Table {...props} />);
  };

  beforeEach(() => {
    props = {
      data: recordRows,
      availableColumns: availableColumns,
      totalDataCount: recordRows.length,
      page: 0,
      loadedData: true,
      loadedCount: true,
      resultsPerPage: 10,
      onPageChange: onPageChange,
      onSort: onSort,
      sort: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with no columns', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with columns', async () => {
    const view = createView();

    await act(async () => {
      screen.getByLabelText('id checkbox').click();
      await flushPromises();
      screen.getByLabelText('shotNum checkbox').click();
      await flushPromises();
      screen.getByLabelText('timestamp checkbox').click();
      await flushPromises();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('displays a record count', () => {
    const recordCount = recordRows.length;
    createView();
    screen.getByText(`1–${recordCount} of ${recordCount}`);
  });

  it('calls onPageChange when page is changed', async () => {
    const recordCount = recordRows.length;
    props.resultsPerPage = 1;
    createView();
    screen.getByText(`1–1 of ${recordCount}`);

    await act(async () => {
      screen.getByLabelText('Go to next page').click();
      await flushPromises();
    });

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('displays page loading message when loadedData is false and totalDataCount is zero', () => {
    props.loadedData = false;
    createView();
    screen.getByText('Loading...');

    cleanup();
    props.loadedData = true;
    props.totalDataCount = 0;
    createView();
    screen.getByText('Loading...');
  });

  it('reverts to first page if the current page number accidentally goes above the maximum available', () => {
    props.page = 100;
    createView();
    expect(onPageChange).toBeCalledWith(0);
  });

  it('waits until we have a result count before counting a maximum page', () => {
    props.loadedCount = false;
    createView();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('adds columns in correct order on checkbox click', async () => {
    createView();

    await act(async () => {
      screen.getByLabelText('id checkbox').click();
      await flushPromises();
      screen.getByLabelText('shotNum checkbox').click();
      await flushPromises();
      screen.getByLabelText('timestamp checkbox').click();
      await flushPromises();
    });

    let columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(3);
    expect(columns[0]).toHaveTextContent('id');
    expect(columns[1]).toHaveTextContent('shotNum');
    expect(columns[2]).toHaveTextContent('timestamp');

    // Remove middle column
    await act(async () => {
      screen.getByLabelText('shotNum checkbox').click();
      await flushPromises();
    });

    columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(2);
    expect(columns[0]).toHaveTextContent('id');
    expect(columns[1]).toHaveTextContent('timestamp');

    await act(async () => {
      screen.getByLabelText('shotNum checkbox').click();
      await flushPromises();
    });

    // Should expect the column previously in the middle to now be on the end
    columns = screen.getAllByRole('columnheader');
    expect(columns.length).toEqual(3);
    expect(columns[0]).toHaveTextContent('id');
    expect(columns[1]).toHaveTextContent('timestamp');
    expect(columns[2]).toHaveTextContent('shotNum');
  });

  it('removes column sort when column is closed', async () => {
    createView();

    await act(async () => {
      screen.getByLabelText('id checkbox').click();
      await flushPromises();
    });

    expect(onSort).not.toHaveBeenCalled();

    await act(async () => {
      screen.getByLabelText('id checkbox').click();
      await flushPromises();
    });

    expect(onSort).toHaveBeenCalledWith('id', null);
  });
});
