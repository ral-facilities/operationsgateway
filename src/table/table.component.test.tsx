import React from 'react';
import Table, { TableProps } from './table.component';
import { screen, cleanup, render } from '@testing-library/react';
import { RecordRow } from '../app.types';
import { Column } from 'react-table';
import { flushPromises } from '../setupTests';

describe('Table', () => {
  let props: TableProps;
  const generateRow = (num: number): RecordRow => ({
    timestamp: new Date(`2022-01-${num < 10 ? '0' + num : num}T00:00:00Z`)
      .getTime()
      .toString(),
    activeArea: `${num}`,
    shotNum: num,
    activeExperiment: `${num}`,
  });
  const recordRows: RecordRow[] = Array.from(Array(3), (_, i) =>
    generateRow(i + 1)
  );
  const availableColumns: Column[] = [
    {
      Header: 'Timestamp',
      id: 'timestamp',
      accessor: 'timestamp',
    },
    {
      Header: 'Shot Number',
      id: 'shotNum',
      accessor: 'shotNum',
    },
    {
      Header: 'Active Area',
      id: 'activeArea',
      accessor: 'activeArea',
    },
    {
      Header: 'Active Experiment',
      id: 'activeExperiment',
      accessor: 'activeExperiment',
    },
  ];
  const onPageChange = jest.fn();
  const onResultsPerPageChange = jest.fn();
  const onSort = jest.fn();
  const onColumnClose = jest.fn();
  const onDragEnd = jest.fn();
  const onColumnWordWrapToggle = jest.fn();

  const createView = () => {
    return render(<Table {...props} />);
  };

  beforeEach(() => {
    props = {
      data: recordRows,
      availableColumns,
      columnStates: {},
      hiddenColumns: ['shotNum', 'activeArea', 'activeExperiment'],
      columnOrder: ['timestamp'],
      totalDataCount: recordRows.length,
      page: 0,
      loadedData: true,
      loadedCount: true,
      resultsPerPage: 25,
      onPageChange,
      onResultsPerPageChange,
      onSort,
      onColumnClose,
      onDragEnd,
      onColumnWordWrapToggle,
      sort: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly, with only timestamp column', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with all columns displayed', async () => {
    props.hiddenColumns = [];
    props.columnOrder = [
      'timestamp',
      'shotNum',
      'activeArea',
      'activeExperiment',
    ];
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('displays a record count', () => {
    const recordCount = recordRows.length;
    createView();
    screen.getByText(`1–${recordCount} of ${recordCount}`);
  });

  it('displays page loading message when loadedData is false and totalDataCount is zero', async () => {
    props.loadedData = false;
    createView();
    screen.getByRole('progressbar');

    cleanup();
    props.loadedData = true;
    props.totalDataCount = 0;
    createView();
    screen.getByRole('progressbar');
  });
});
