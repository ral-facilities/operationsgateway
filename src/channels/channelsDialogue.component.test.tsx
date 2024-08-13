import { QueryClient } from '@tanstack/react-query';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { staticChannels } from '../api/channels';
import { RootState } from '../state/store';
import {
  getInitialState,
  renderComponentWithProviders,
  testChannels,
} from '../testUtils';
import ChannelsDialogue, {
  selectChannelTree,
  TreeNode,
} from './channelsDialogue.component';

describe('selectChannelTree', () => {
  it('transforms channel list with selection info into TreeNode', () => {
    const selectedIds = [...Object.keys(staticChannels), 'CHANNEL_ABCDE'];
    const channelTree = selectChannelTree(testChannels, selectedIds);

    const expectedTree: TreeNode = {
      name: '/',
      children: {
        system: {
          name: 'system',
          checked: true,
          children: Object.fromEntries(
            Object.entries(staticChannels).map(([channelName, channel]) => [
              channelName,
              {
                ...channel,
                checked: selectedIds.some((channel) => channel === channelName),
              },
            ])
          ),
        },
        Channels: {
          name: 'Channels',
          checked: undefined,
          children: {
            '1': {
              name: '1',
              checked: undefined,
              children: testChannels.reduce((prev, curr) => {
                if (curr.path.includes('1'))
                  prev[curr.systemName] = {
                    ...curr,
                    checked: selectedIds.some(
                      (channel) => channel === curr.systemName
                    ),
                  };

                return prev;
              }, {}),
            },
            '2': {
              name: '2',
              checked: false,
              children: testChannels.reduce((prev, curr) => {
                if (curr.path.includes('2'))
                  prev[curr.systemName] = {
                    ...curr,
                    checked: selectedIds.some(
                      (channel) => channel === curr.systemName
                    ),
                  };

                return prev;
              }, {}),
            },
            '3': {
              name: '3',
              checked: false,
              children: testChannels.reduce((prev, curr) => {
                if (curr.path.includes('3'))
                  prev[curr.systemName] = {
                    ...curr,
                    checked: selectedIds.some(
                      (channel) => channel === curr.systemName
                    ),
                  };

                return prev;
              }, {}),
            },
          },
        },
      },
    };

    expect(channelTree).toStrictEqual(expectedTree);
  });
});

describe('Channels Dialogue', () => {
  let props: React.ComponentProps<typeof ChannelsDialogue>;
  let user;

  const createView = (
    initialState?: Partial<RootState>,
    queryClient?: QueryClient
  ) => {
    return renderComponentWithProviders(<ChannelsDialogue {...props} />, {
      preloadedState: initialState,
      queryClient,
    });
  };

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      open: true,
      onClose: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders channels dialogue when dialogue is open', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    // wait for the channels to load before taking the screenshot
    await screen.findByRole('button', { name: 'system' });

    // do some interaction to let UI load fully (i.e touch ripples)
    await user.hover(screen.getByText('Data Channels'));

    expect(baseElement).toMatchSnapshot();
  });

  it("doesn't render channels dialogue when dialogue is closed", async () => {
    props.open = false;

    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onClose when close button is clicked', async () => {
    createView();

    await user.click(screen.getByText('Close'));

    expect(props.onClose).toHaveBeenCalled();
  });

  it('dispatches updateSelectedColumns and onClose when apply button is clicked', async () => {
    const state = {
      ...getInitialState(),
      table: {
        ...getInitialState().table,
        selectedColumnIds: ['timestamp', 'activeArea', 'test_1'],
      },
    };

    const { store } = createView(state);

    await user.click(await screen.findByText('system'));

    expect(screen.getByRole('checkbox', { name: 'Active Area' })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Shot Number' })
    ).not.toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Shot Number' }));
    await user.click(screen.getByRole('checkbox', { name: 'Active Area' }));

    await user.click(screen.getByText('Add Channels'));

    expect(store.getState().table.selectedColumnIds).toStrictEqual([
      'timestamp',
      'test_1',
      'shotnum',
    ]);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('selects a channel in the metadata panel & channel tree when search box is used', async () => {
    createView();

    const search = screen.getByLabelText('Search data channels');

    await user.type(search, 'shot{arrowdown}{enter}');

    // shot number should be visible in tree view
    expect(
      screen.getByRole('checkbox', { name: 'Shot Number' })
    ).toBeInTheDocument();

    // shot number should be selected in the metadata panel
    expect(screen.getByText('System name: shotnum')).toBeInTheDocument();
  });
});
