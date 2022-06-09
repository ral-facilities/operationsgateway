import React from 'react';
import DataHeader, { DataHeaderProps } from './dataHeader.component';
import { render, RenderResult, screen } from '@testing-library/react';

describe('Data Header', () => {
  let props: DataHeaderProps;
  const onSort = jest.fn();

  const createView = (): RenderResult => {
    return render(<DataHeader {...props} />);
  };

  beforeEach(() => {
    props = {
      key: 'test',
      dataKey: 'test',
      sort: {},
      onSort: onSort,
      label: 'Test',
      icon: function Icon() {
        return <div>Test</div>;
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly without sort or filter', () => {
    props.disableSort = true;
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with sort but no filter', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it.todo('renders correctly with filter but no sort');

  it.todo('renders correctly with sort and filter');

  describe('calls the onSort method when label is clicked', () => {
    it('sets asc order', () => {
      createView();
      screen.getAllByText('Test')[1].click();
      expect(onSort).toHaveBeenCalledWith('test', 'asc');
    });

    it('sets desc order', () => {
      props.sort = {
        test: 'asc',
      };

      createView();
      screen.getAllByText('Test')[1].click();
      expect(onSort).toHaveBeenCalledWith('test', 'desc');
    });

    it('sets null order', () => {
      props.sort = {
        test: 'desc',
      };

      createView();
      screen.getAllByText('Test')[1].click();
      expect(onSort).toHaveBeenCalledWith('test', null);
    });
  });

  describe('calls the onSort method when default sort is specified', () => {
    it('sets asc order', () => {
      props.defaultSort = 'asc';

      createView();
      expect(onSort).toHaveBeenCalledWith('test', 'asc');
    });

    it('sets desc order', () => {
      props.defaultSort = 'desc';

      createView();
      expect(onSort).toHaveBeenCalledWith('test', 'desc');
    });
  });

  it.todo('calls the resizeColumn method when column resizer is dragged');
});
