import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { staticChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';
import channelsJson from '../mocks/channels.json';
import { TreeNode } from './channelsDialogue.component';
import ChannelTree from './channelTree.component';

describe('Channel Tree', () => {
  let currNode = '';
  const setCurrNode = jest.fn();
  const handleChannelChecked = jest.fn();
  const handleChannelSelected = jest.fn();
  const channel1 = {
    ...Object.values(channelsJson.channels)[0],
    systemName: Object.keys(channelsJson.channels)[0],
  } as FullChannelMetadata;
  const channel2 = {
    ...Object.values(channelsJson.channels)[1],
    systemName: Object.keys(channelsJson.channels)[1],
  } as FullChannelMetadata;

  const tree: TreeNode = {
    name: '/',
    checked: false,
    children: {
      test_1: {
        name: 'test_1',
        checked: undefined,
        children: {
          timestamp: { ...staticChannels['timestamp'], checked: false },
          [channel1.systemName]: {
            ...channel1,
            checked: false,
          },
          [channel2.systemName]: {
            ...channel2,
            checked: true,
          },
        },
      },
      test_2: {
        name: 'test_2',
        checked: false,
        children: {
          test_3: { name: 'test_3', checked: false, children: {} },
        },
      },
    },
  };
  const createView = () => {
    return render(
      <ChannelTree
        currNode={currNode}
        setCurrNode={setCurrNode}
        handleChannelChecked={handleChannelChecked}
        handleChannelSelected={handleChannelSelected}
        tree={tree}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly for root', () => {
    currNode = '/';
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for sub node', () => {
    currNode = '/test_1';
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should call setCurrNode when non-leaf node is clicked', async () => {
    const user = userEvent.setup();
    currNode = '/';
    createView();

    await user.click(screen.getByText('test_2'));
    expect(setCurrNode).toHaveBeenCalledWith('/test_2');
  });

  it('should call setCurrNode when non-leaf node is clicked from non-leaf node', async () => {
    const user = userEvent.setup();
    currNode = '/test_2';
    createView();

    await user.click(screen.getByText('test_3'));
    expect(setCurrNode).toHaveBeenCalledWith('/test_2/test_3');
  });

  it('should call handleChannelChecked when leaf node checkbox is clicked', async () => {
    const user = userEvent.setup();
    currNode = '/test_1';
    createView();

    await user.click(
      screen.getByRole('checkbox', {
        name: channel1.name,
      })
    );
    expect(handleChannelChecked).toHaveBeenCalledWith(
      channel1.systemName,
      false
    );

    handleChannelChecked.mockClear();

    await user.click(
      screen.getByRole('checkbox', {
        name: channel2.name,
      })
    );
    expect(handleChannelChecked).toHaveBeenCalledWith(
      channel2.systemName,
      true
    );
  });

  it('should call handleChannelSelected when leaf node is clicked', async () => {
    const user = userEvent.setup();
    currNode = '/test_1';
    createView();

    await user.click(
      screen.getByLabelText(channel1.name ?? channel1.systemName)
    );
    expect(handleChannelSelected).toHaveBeenCalledWith({
      ...channel1,
      checked: false,
    });

    handleChannelChecked.mockClear();

    await user.click(
      screen.getByLabelText(channel2.name ?? channel2.systemName)
    );
    expect(handleChannelSelected).toHaveBeenCalledWith({
      ...channel2,
      checked: true,
    });
  });
});
