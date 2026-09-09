import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testChannels } from '../testUtils';
import ChannelSearch from './channelSearch.component';

describe('Channel Search', () => {
  let currPathAndChannel = '';
  const onSearchChange = vi.fn();
  let channels = testChannels;

  beforeEach(() => {
    channels = testChannels;
  });

  const createView = () => {
    return render(
      <ChannelSearch
        currPathAndChannel={currPathAndChannel}
        onSearchChange={onSearchChange}
        channels={channels}
      />
    );
  };

  it('should render correctly', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should call onSearchChange when option is selected and not when it is cleared', async () => {
    const testChannel = testChannels.find(
      (channel) => channel.systemName === 'shotnum'
    )!;
    currPathAndChannel = `${testChannel.path}/${testChannel.systemName}`;
    const user = userEvent.setup();
    createView();

    const search = screen.getByLabelText('Search data channels');

    await user.type(search, 'shot{arrowdown}{enter}');

    expect(onSearchChange).toHaveBeenCalledWith(testChannel);
    expect(search).toHaveValue('Shot Number (shotnum)');

    onSearchChange.mockClear();
    await user.click(screen.getByLabelText('Clear'));

    expect(onSearchChange).not.toHaveBeenCalled();
    expect(search).toHaveValue('');
  });

  it('should correctly render channel names', async () => {
    channels = [
      { systemName: 'channel_1', type: 'scalar', path: '/test' },
      {
        systemName: 'channel_2',
        name: 'channel_2',
        type: 'scalar',
        path: '/test',
      },
      {
        systemName: 'channel_3',
        name: 'Channel 3',
        type: 'scalar',
        path: '/test',
      },
    ];
    const user = userEvent.setup();
    createView();

    const search = screen.getByLabelText('Search data channels');
    await user.click(search);

    expect(screen.getByRole('option', { name: 'channel_1' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'channel_2' })).toBeVisible();
    expect(
      screen.getByRole('option', { name: 'Channel 3 (channel_3)' })
    ).toBeVisible();
  });

  it('should clear the input when currPathAndChannel no longer matches', async () => {
    const testChannel = testChannels.find(
      (channel) => channel.systemName === 'shotnum'
    )!;
    currPathAndChannel = `${testChannel.path}/${testChannel.systemName}`;
    const user = userEvent.setup();
    const { rerender } = createView();

    const search = screen.getByLabelText('Search data channels');

    await user.type(search, 'shot{arrowdown}{enter}');
    expect(search).toHaveValue('Shot Number (shotnum)');

    rerender(
      <ChannelSearch
        currPathAndChannel={''}
        onSearchChange={onSearchChange}
        channels={testChannels}
      />
    );

    expect(search).toHaveValue('');
  });
});
