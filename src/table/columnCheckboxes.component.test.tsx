import React from 'react';
import { Column } from 'react-table';
import ColumnCheckboxes, {
  ColumnCheckboxesProps,
} from './columnCheckboxes.component';
import { render, RenderResult, screen, act } from '@testing-library/react';
import { flushPromises } from '../setupTests';

describe('Column Checkboxes', () => {
  let props: ColumnCheckboxesProps;
  const onColumnOpen = jest.fn();
  const onColumnClose = jest.fn();
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
  const selectedColumns: Column[] = [];

  const createView = (): RenderResult => {
    return render(<ColumnCheckboxes {...props} />);
  };

  beforeEach(() => {
    props = {
      onColumnOpen: onColumnOpen,
      onColumnClose: onColumnClose,
      availableColumns: availableColumns,
      selectedColumns: selectedColumns,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when unchecked', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when checked', () => {
    props.selectedColumns = availableColumns;
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

  it('calls onColumnOpen when checkbox is checked', async () => {
    createView();
    await act(async () => {
      screen.getByLabelText('name checkbox').click();
      await flushPromises();
    });
    expect(onColumnOpen).toHaveBeenCalledWith('name');
  });

  it('calls onColumnClose when checkbox is unchecked', async () => {
    props.selectedColumns = availableColumns;
    createView();
    await act(async () => {
      screen.getByLabelText('name checkbox').click();
      await flushPromises();
    });
    expect(onColumnClose).toHaveBeenCalledWith('name');
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
