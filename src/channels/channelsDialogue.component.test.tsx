import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ChannelsDialogue, {
  selectChannelTree,
  TreeNode,
} from './channelsDialogue.component';
import {
  getInitialState,
  renderComponentWithProviders,
  testChannels,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';
import { RootState } from '../state/store';
import { staticChannels } from '../api/channels';

describe('selectChannelTree', () => {
  it('transforms channel list with selection info into TreeNode', () => {
    const channels = testChannels;
    channels[5].path = '/test_1';
    channels[6].path = '/test_3/test_3_sub';
    const selectedIds = ['timestamp', 'shotnum', 'test_1'];
    const channelTree = selectChannelTree({}, channels ?? [], selectedIds);

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
        test_1: {
          name: 'test_1',
          checked: false,
          children: {
            [testChannels[4].systemName]: {
              ...testChannels[4],
              checked: true,
            },
            [testChannels[5].systemName]: {
              ...testChannels[5],
              checked: false,
            },
          },
        },
        test_3: {
          name: 'test_3',
          checked: false,
          children: {
            test_3_sub: {
              name: 'test_3_sub',
              checked: false,
              children: {
                [testChannels[6].systemName]: {
                  ...testChannels[6],
                  checked: false,
                },
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

    (axios.get as jest.Mock).mockResolvedValue({
      data: { channels: testChannels.slice(4) },
    });
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
