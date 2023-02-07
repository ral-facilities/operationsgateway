import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ChannelsDialogue, {
  selectChannelTree,
  TreeNode,
} from './channelsDialogue.component';
import {
  getInitialState,
  testChannels,
  renderComponentWithProviders,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { QueryClient } from '@tanstack/react-query';
import { RootState } from '../state/store';
import { staticChannels } from '../api/channels';

describe('selectChannelTree', () => {
  it('transforms channel list with selection info into TreeNode', () => {
    const selectedIds = ['timestamp', 'shotnum', 'CHANNEL_ABCDE'];
    const channelTree = selectChannelTree({}, testChannels, selectedIds);

    const expectedTree: TreeNode = {
      name: '/',
      checked: false,
      children: {
        system: {
          name: 'system',
          checked: false,
          children: Object.fromEntries(
            Object.entries(staticChannels).map(([channelName, channel]) => [
              channelName,
              {
                ...channel,
                checked: selectedIds.find((channel) => channel === channelName)
                  ? true
                  : false,
              },
            ])
          ),
        },
        Channels: {
          name: 'Channels',
          checked: false,
          children: {
            '1': {
              name: '1',
              checked: false,
              children: {
                ...Object.fromEntries(
                  testChannels
                    .filter((channel) => channel.path.includes('1'))
                    .map((channel) => [
                      channel.systemName,
                      {
                        ...channel,
                        checked:
                          channel.systemName === 'CHANNEL_ABCDE' ? true : false,
                      },
                    ])
                ),
              },
            },
            '2': {
              name: '2',
              checked: false,
              children: {
                ...Object.fromEntries(
                  testChannels
                    .filter((channel) => channel.path.includes('2'))
                    .map((channel) => [
                      channel.systemName,
                      {
                        ...channel,
                        checked: false,
                      },
                    ])
                ),
              },
            },
            '3': {
              name: '3',
              checked: false,
              children: {
                ...Object.fromEntries(
                  testChannels
                    .filter((channel) => channel.path.includes('3'))
                    .map((channel) => [
                      channel.systemName,
                      {
                        ...channel,
                        checked: false,
                      },
                    ])
                ),
              },
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
    initialState?: PreloadedState<RootState>,
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
    await screen.findByText('system');
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
});
