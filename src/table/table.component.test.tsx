import React from 'react';
import Table, { TableProps } from './table.component';
import { render, RenderResult, screen, cleanup } from '@testing-library/react';
import { RecordRow } from '../app.types';
import { Column } from 'react-table';

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
  const displayedColumns: Column[] = [
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

  const createWrapper = (): RenderResult => {
    return render(<Table {...props} />);
  };

  beforeEach(() => {
    props = {
      data: recordRows,
      displayedColumns: displayedColumns,
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

  it('renders correctly', async () => {
    const view = createWrapper();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls onSort function when sort label clicked', () => {
    createWrapper();
    screen.getByText('ID').click();

    expect(onSort).toHaveBeenCalledWith('id', 'asc');
  });

  it('displays a record count', () => {
    const recordCount = recordRows.length;
    createWrapper();
    screen.getByText(`1–${recordCount} of ${recordCount}`);
  });

  it('calls onPageChange when page is changed', () => {
    const recordCount = recordRows.length;
    props.resultsPerPage = 1;
    createWrapper();
    screen.getByText(`1–1 of ${recordCount}`);
    screen.getByLabelText('Go to next page').click();

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('displays page loading message when loadedData is false and totalDataCount is zero', () => {
    props.loadedData = false;
    createWrapper();
    screen.getByText('Loading...');

    cleanup();
    props.loadedData = true;
    props.totalDataCount = 0;
    createWrapper();
    screen.getByText('Loading...');
  });

  it('reverts to first page if the current page number accidentally goes above the maximum available', () => {
    props.page = 100;
    createWrapper();
    expect(onPageChange).toBeCalledWith(0);
  });

  it('waits until we have a result count before counting a maximum page', () => {
    props.loadedCount = false;
    createWrapper();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it.todo('calls onSort function when defaultSort has been specified');

  it.todo('resizes columns correctly');
});
