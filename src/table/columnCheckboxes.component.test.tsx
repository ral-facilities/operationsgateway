import React from 'react';
import { Column } from 'react-table';
import ColumnCheckboxes, {
  ColumnCheckboxesProps,
} from './columnCheckboxes.component';
import { render, RenderResult, screen, cleanup } from '@testing-library/react';

describe('Column Checkboxes', () => {
  let props: ColumnCheckboxesProps;
  const onChecked = jest.fn();
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
  const displayedColumns: Column[] = [];

  const createView = (): RenderResult => {
    return render(<ColumnCheckboxes {...props} />);
  };

  beforeEach(() => {
    props = {
      onChecked: onChecked,
      availableColumns: availableColumns,
      displayedColumns: displayedColumns,
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
    props.displayedColumns = availableColumns;
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls onChecked when checkbox is clicked', () => {
    createView();
    screen.getAllByRole('checkbox')[0].click();
    expect(onChecked).toHaveBeenCalledWith('id', true);

    cleanup();
    props.displayedColumns = availableColumns;
    createView();
    screen.getAllByRole('checkbox')[1].click();
    expect(onChecked).toHaveBeenCalledWith('name', false);
  });

  it('returns null if a column is not fully defined', () => {
    availableColumns[1].Header = null;
    availableColumns[1].accessor = null;

    createView();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toEqual(1);
    expect(screen.queryByText('Name')).toBeNull();
  });

  it.todo('calls onUnchecked when checkbox is unselected?');

  it.todo('calls onChecked when checkbox is clicked via shift-click');
});
