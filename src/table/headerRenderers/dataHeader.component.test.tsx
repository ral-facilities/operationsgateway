import React from 'react';
import DataHeader, { DataHeaderProps } from './dataHeader.component';
import {
  render,
  RenderResult,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { flushPromises } from '../../setupTests';

describe('Data Header', () => {
  let props: DataHeaderProps;
  const onSort = jest.fn();
  const onClose = jest.fn();
  const onToggleWordWrap = jest.fn();
  const handleOnDragEnd = jest.fn();
  const openFilters = jest.fn();

  const createView = (): RenderResult => {
    return render(
      <table>
        <thead>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="columns" direction="horizontal">
              {(provided) => (
                <tr {...provided.droppableProps} ref={provided.innerRef}>
                  <DataHeader {...props} />
                </tr>
              )}
            </Droppable>
          </DragDropContext>
        </thead>
      </table>
    );
  };

  beforeEach(() => {
    props = {
      dataKey: 'test',
      sort: {},
      onSort,
      onClose,
      label: 'Test',
      resizerProps: {},
      index: 0,
      channelInfo: {
        systemName: 'Test',
        channel_dtype: 'scalar',
        units: 'm',
        description: 'test description',
      },
      wordWrap: false,
      onToggleWordWrap,
      isFiltered: false,
      openFilters,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    props.disableSort = true;
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with sort applied', () => {
    createView();
    expect(screen.getByTestId('sort test')).toBeInTheDocument();
  });

  it('renders correctly with filter applied', () => {
    props.isFiltered = true;
    createView();
    expect(screen.getByLabelText('open filters')).toBeInTheDocument();
  });

  it('renders a column icon if provided', () => {
    props.icon = <div data-testid="test icon">Icon</div>;
    createView();
    expect(screen.getByTestId('test icon')).toBeInTheDocument();
  });

  it('calls the openFilters method when the filter button is clicked', async () => {
    props.isFiltered = true;
    createView();
    await act(async () => {
      screen.getByLabelText('open filters').click();
      await flushPromises();
    });

    expect(openFilters).toHaveBeenCalledWith(props.dataKey);
  });

  it('opens menu when menu icon is clicked', () => {
    createView();
    const menuIcon = screen.getByLabelText('test menu');

    fireEvent.click(menuIcon);

    const menu = screen.getByRole('menu');

    expect(menu).toMatchSnapshot();
  });

  it('calls onToggleWordWrap when toggle word wrap option is clicked', () => {
    createView();
    const menuIcon = screen.getByLabelText('test menu');

    fireEvent.click(menuIcon);

    const closeOption = screen.getByText('Turn word wrap', { exact: false });
    fireEvent.click(closeOption);
    expect(onToggleWordWrap).toHaveBeenCalledWith('test');
  });

  it('calls onClose when close option is clicked', () => {
    createView();
    const menuIcon = screen.getByLabelText('test menu');

    fireEvent.click(menuIcon);

    const closeOption = screen.getByText('Close');
    fireEvent.click(closeOption);
    expect(onClose).toHaveBeenCalledWith('test');
  });

  it('removes column from display when header is middle clicked', () => {
    createView();
    const header = screen.getByLabelText('test header');
    fireEvent.mouseDown(header, { button: 1 });
    expect(onClose).toHaveBeenCalledWith('test');
  });

  describe('calls the onSort method when label is clicked', () => {
    it('sets asc order', async () => {
      createView();
      await act(async () => {
        screen.getByTestId('sort test').click();
        await flushPromises();
      });

      expect(onSort).toHaveBeenCalledWith('test', 'asc');
    });

    it('sets desc order', async () => {
      props.sort = {
        test: 'asc',
      };

      createView();
      await act(async () => {
        screen.getByTestId('sort test').click();
        await flushPromises();
      });
      expect(onSort).toHaveBeenCalledWith('test', 'desc');
    });

    it('sets null order', async () => {
      props.sort = {
        test: 'desc',
      };

      createView();
      await act(async () => {
        screen.getByTestId('sort test').click();
        await flushPromises();
      });
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

  it('displays tooltip when user hovers over column name', async () => {
    createView();
    const header = screen.getByText('Test');

    fireEvent(
      header,
      new MouseEvent('mouseover', {
        bubbles: true,
      })
    );

    expect(
      await screen.findByText('Units: m', {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('System Name: Test', {
        exact: false,
      })
    ).not.toBeInTheDocument();
  });

  it('displays tooltip with system name when user hovers over friendly column name', async () => {
    props.label = 'Test Friendly Name';
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    props.channelInfo!.userFriendlyName = props.label as string;
    createView();
    const header = screen.getByText('Test Friendly Name');

    fireEvent(
      header,
      new MouseEvent('mouseover', {
        bubbles: true,
      })
    );

    expect(
      await screen.findByText('System Name: Test', {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
