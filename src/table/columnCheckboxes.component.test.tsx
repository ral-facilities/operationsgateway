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
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
  ];
  const checkedColumns: Column[] = [];

  const createView = (): RenderResult => {
    return render(<ColumnCheckboxes {...props} />);
  };

  beforeEach(() => {
    props = {
      onColumnOpen: onColumnOpen,
      onColumnClose: onColumnClose,
      availableColumns: availableColumns,
      checkedColumns: checkedColumns,
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
    props.checkedColumns = availableColumns;
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls onColumnOpen when checkbox is checked', async () => {
    createView();
    await act(async () => {
      screen.getByLabelText('id checkbox').click();
      await flushPromises();
    });
    expect(onColumnOpen).toHaveBeenCalledWith('id');
  });

  it('calls onColumnClose when checkbox is unchecked', async () => {
    props.checkedColumns = availableColumns;
    createView();
    await act(async () => {
      screen.getByLabelText('id checkbox').click();
      await flushPromises();
    });
    expect(onColumnClose).toHaveBeenCalledWith('id');
  });

  it('returns null if a column is not fully defined', () => {
    availableColumns[1].Header = undefined;
    availableColumns[1].accessor = undefined;

    createView();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toEqual(1);
    expect(screen.queryByText('Name')).toBeNull();
  });

  it.todo('calls onChecked when checkbox is clicked via shift-click');
});
