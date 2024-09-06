import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import {
  act,
  render,
  RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { flushPromises } from '../../testUtils';
import DataHeader, { DataHeaderProps } from './dataHeader.component';

describe('Data Header', () => {
  let props: DataHeaderProps;
  const onSort = vi.fn();
  const onClose = vi.fn();
  const onToggleWordWrap = vi.fn();
  const handleOnDragEnd = vi.fn();
  const openFilters = vi.fn();
  const resizeHandler = vi.fn();
  let user;

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
    user = userEvent.setup();
    props = {
      dataKey: 'test',
      sort: {},
      onSort,
      onClose,
      label: 'Test',
      resizeHandler,
      index: 0,
      channelInfo: {
        systemName: 'Test',
        type: 'scalar',
        units: 'm',
        description: 'test description',
        path: '/test',
      },
      wordWrap: false,
      onToggleWordWrap,
      isFiltered: false,
      openFilters,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      await user.click(screen.getByLabelText('open filters'));
      await flushPromises();
    });

    expect(openFilters).toHaveBeenCalledWith(props.dataKey);
  });

  it('opens menu when menu icon is clicked', async () => {
    createView();
    const menuIcon = screen.getByLabelText('test menu');
    await user.click(menuIcon);

    const menu = screen.getByRole('menu');

    expect(menu).toMatchSnapshot();
  });

  it('calls onToggleWordWrap when toggle word wrap option is clicked', async () => {
    createView();
    const menuIcon = screen.getByLabelText('test menu');
    await user.click(menuIcon);

    const menu = screen.getByRole('menu');
    const closeOption = within(menu).getByText('Turn word wrap on');
    await user.click(closeOption);
    expect(onToggleWordWrap).toHaveBeenCalledWith('test');
  });

  it('shows opposite word wrap toggle text if word wrap is already on', async () => {
    props.wordWrap = true;
    createView();
    const menuIcon = screen.getByLabelText('test menu');
    await user.click(menuIcon);

    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Turn word wrap off')).toBeInTheDocument();
  });

  it('calls onClose when close option is clicked', async () => {
    createView();
    const menuIcon = screen.getByLabelText('test menu');
    await user.click(menuIcon);

    const closeOption = screen.getByText('Close');
    await user.click(closeOption);
    expect(onClose).toHaveBeenCalledWith('test');
  });

  it('removes column from display when header is middle clicked', async () => {
    createView();
    const header = screen.getByText('Test');
    await user.pointer([{ keys: '[MouseMiddle]', target: header }]);
    expect(onClose).toHaveBeenCalledWith('test');
  });

  describe('calls the onSort method when label is clicked', () => {
    it('sets asc order', async () => {
      createView();
      await act(async () => {
        await user.click(screen.getByTestId('sort test'));
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
        await user.click(screen.getByTestId('sort test'));
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
        await user.click(screen.getByTestId('sort test'));
        await flushPromises();
      });
      expect(onSort).toHaveBeenCalledWith('test', null);
    });
  });

  it('displays tooltip when user hovers over column name', async () => {
    createView();
    const header = screen.getByText('Test');

    await user.hover(header);

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

    props.channelInfo!.name = props.label as string;
    createView();
    const header = screen.getByText('Test Friendly Name');

    await user.hover(header);

    expect(
      await screen.findByText('System Name: Test', {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
