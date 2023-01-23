import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TreeNode } from './channelsDialogue.component';
import ChannelTree from './channelTree.component';
import { testChannels } from '../setupTests';

describe('Channel Tree', () => {
  let currNode = '';
  const setCurrNode = jest.fn();
  const handleChannelChecked = jest.fn();
  const tree: TreeNode = {
    name: '/',
    checked: false,
    children: {
      test_1: {
        name: 'test_1',
        checked: false,
        children: {
          timestamp: { ...testChannels['timestamp'], checked: false },
          [testChannels[4].systemName]: { ...testChannels[4], checked: false },
          [testChannels[5].systemName]: { ...testChannels[5], checked: true },
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

  it('should call handleChannelChecked when leaf node is clicked', async () => {
    const user = userEvent.setup();
    currNode = '/test_1';
    createView();

    await user.click(
      screen.getByRole('checkbox', { name: testChannels[4].systemName })
    );
    expect(handleChannelChecked).toHaveBeenCalledWith(
      testChannels[4].systemName,
      false
    );

    handleChannelChecked.mockClear();

    await user.click(
      screen.getByRole('checkbox', { name: testChannels[5].systemName })
    );
    expect(handleChannelChecked).toHaveBeenCalledWith(
      testChannels[5].systemName,
      true
    );
  });

  it('should not call handleChannelChecked when timestamp is clicked', async () => {
    const user = userEvent.setup();
    currNode = '/test_1';
    createView();

    expect(screen.getByRole('checkbox', { name: 'timestamp' })).toBeDisabled();
    await user.click(screen.getByText('timestamp'));
    expect(handleChannelChecked).not.toHaveBeenCalled();
  });
});
