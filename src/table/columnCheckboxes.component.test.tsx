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
      Header: 'Timestamp',
      accessor: 'timestamp',
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

  it('does not render an ID checkbox if an ID column exists', () => {
    const amendedColumns: Column[] = [
      ...availableColumns,
      {
        Header: 'ID',
        accessor: 'id',
      },
    ];
    props = {
      ...props,
      availableColumns: amendedColumns,
    };

    createView();
    expect(screen.queryByLabelText('id checkbox')).toBeNull();
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
    availableColumns[1].Header = undefined;
    availableColumns[1].accessor = undefined;

    createView();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toEqual(1);
    expect(screen.queryByText('Timestamp')).toBeNull();
  });

  it.todo('calls onChecked when checkbox is clicked via shift-click');
});
