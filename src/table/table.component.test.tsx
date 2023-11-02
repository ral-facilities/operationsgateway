import React from 'react';
import Table, { TableProps } from './table.component';
import { screen, render } from '@testing-library/react';
import { RecordRow } from '../app.types';
import { ColumnDef } from '@tanstack/react-table';
import userEvent from '@testing-library/user-event';

describe('Table', () => {
  let props: TableProps;
  const generateRow = (num: number): RecordRow => ({
    _id: `${num}`,
    timestamp: new Date(`2022-01-${num < 10 ? '0' + num : num}T00:00:00`)
      .getTime()
      .toString(),
    activeArea: `${num}`,
    shotnum: num,
    activeExperiment: `${num}`,
  });
  const recordRows: RecordRow[] = Array.from(Array(3), (_, i) =>
    generateRow(i + 1)
  );
  const availableColumns: ColumnDef<RecordRow>[] = [
    {
      header: 'Timestamp',
      id: 'timestamp',
      accessorKey: 'timestamp',
    },
    {
      header: 'Shot Number',
      id: 'shotnum',
      accessorKey: 'shotnum',
    },
    {
      header: 'Active Area',
      id: 'activeArea',
      accessorKey: 'activeArea',
    },
    {
      header: 'Active Experiment',
      id: 'activeExperiment',
      accessorKey: 'activeExperiment',
    },
  ];
  const onPageChange = jest.fn();
  const onResultsPerPageChange = jest.fn();
  const onSort = jest.fn();
  const onColumnClose = jest.fn();
  const onDragEnd = jest.fn();
  const onColumnWordWrapToggle = jest.fn();
  const openFilters = jest.fn();

  const createView = () => {
    return render(<Table {...props} />);
  };

  beforeEach(() => {
    props = {
      tableHeight: '100px',
      data: recordRows,
      availableColumns,
      columnStates: {},
      columnVisibility: {
        shotnum: false,
        activeArea: false,
        activeExperiment: false,
      },
      columnOrder: ['timestamp'],
      totalDataCount: recordRows.length,
      maxShots: 50,
      page: 0,
      loadedData: true,
      loadedCount: true,
      resultsPerPage: 25,
      onPageChange,
      onResultsPerPageChange,
      sort: {},
      onSort,
      onColumnClose,
      onDragEnd,
      onColumnWordWrapToggle,
      openFilters,
      filteredChannelNames: [],
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
    props.columnVisibility = {};
    props.columnOrder = [
      'timestamp',
      'shotnum',
      'activeArea',
      'activeExperiment',
    ];
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('displays a record count', () => {
    it('displays the total data count if maxShots > number of rows', () => {
      const recordCount = recordRows.length;
      createView();
      screen.getByText(`1–${recordCount} of ${recordCount}`);
    });

    it('displays the total data count if maxShots === "Unlimited"', () => {
      props = {
        ...props,
        maxShots: Infinity,
      };
      const recordCount = recordRows.length;
      createView();
      screen.getByText(`1–${recordCount} of ${recordCount}`);
    });

    it('displays the maxShots value if maxShots <= number of rows', () => {
      props = {
        ...props,
        maxShots: 1,
      };
      createView();
      screen.getByText('1–1 of 1');
    });
  });

  it('displays page loading message when loadedData is false', async () => {
    props = {
      ...props,
      data: [],
      totalDataCount: 0,
      loadedData: false,
      loadedCount: false,
      columnVisibility: {},
      columnOrder: [],
    };
    createView();
    screen.getByRole('progressbar');
  });

  it('displays no results message when total data count is zero', () => {
    props.totalDataCount = 0;
    createView();

    screen.getByLabelText('no results message');
  });

  it('calls onPageChange when page is changed', async () => {
    const user = userEvent.setup();
    props = {
      ...props,
      totalDataCount: 50,
    };
    const { rerender } = createView();

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    // React Table pagination is zero-based
    expect(onPageChange).toHaveBeenCalledWith(1);

    props = {
      ...props,
      page: 1,
    };
    rerender(<Table {...props} />);
    await user.click(
      screen.getByRole('button', { name: 'Go to previous page' })
    );
    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it('calls onResultsPerPageChange when rows per page is changed', async () => {
    const user = userEvent.setup();
    props = {
      ...props,
      totalDataCount: 50,
    };
    createView();

    await user.click(screen.getByRole('button', { name: 'Rows per page: 25' }));

    // expect 100 to not exist as maxShots is 50
    expect(
      screen.queryByRole('option', { name: '100' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: '10' }));
    expect(onResultsPerPageChange).toHaveBeenCalledWith(10);
  });

  it('allows the user to have 100 rows per page when max shots is greater than 50', async () => {
    const user = userEvent.setup();
    props = {
      ...props,
      maxShots: 1000,
    };
    createView();

    await user.click(screen.getByRole('button', { name: 'Rows per page: 25' }));

    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
  });
});
