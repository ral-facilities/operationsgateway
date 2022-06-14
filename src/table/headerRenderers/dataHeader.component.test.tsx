import React from 'react';
import DataHeader, { DataHeaderProps } from './dataHeader.component';
import {
  render,
  RenderResult,
  screen,
  fireEvent,
} from '@testing-library/react';

describe('Data Header', () => {
  let props: DataHeaderProps;
  const onSort = jest.fn();
  const onClose = jest.fn();

  const createView = (): RenderResult => {
    return render(
      <table>
        <thead>
          <tr>
            <DataHeader {...props} />
          </tr>
        </thead>
      </table>
    );
  };

  beforeEach(() => {
    props = {
      dataKey: 'test',
      sort: {},
      onSort: onSort,
      onClose: onClose,
      label: 'Test',
      icon: function Icon() {
        return <div>Test</div>;
      },
      resizerProps: {},
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

  it('calls onClose when close icon is clicked', () => {
    createView();
    const icon = screen.getByLabelText('close test');

    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(icon.firstChild);

    expect(onClose).toHaveBeenCalledWith('test');
  });

  it('removes column from display when header is middle clicked', () => {
    createView();
    const header = screen.getByLabelText('test header');
    fireEvent.mouseDown(header, { button: 1 });
    expect(onClose).toHaveBeenCalledWith('test');
  });

  it.todo('renders correctly with filter but no sort');

  it.todo('renders correctly with sort and filter');

  describe('calls the onSort method when label is clicked', () => {
    it('sets asc order', () => {
      createView();
      screen.getByTestId('sort test').click();
      expect(onSort).toHaveBeenCalledWith('test', 'asc');
    });

    it('sets desc order', () => {
      props.sort = {
        test: 'asc',
      };

      createView();
      screen.getByTestId('sort test').click();
      expect(onSort).toHaveBeenCalledWith('test', 'desc');
    });

    it('sets null order', () => {
      props.sort = {
        test: 'desc',
      };

      createView();
      screen.getByTestId('sort test').click();
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
});
