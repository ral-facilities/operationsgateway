import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testChannels } from '../testUtils';
import ChannelSearch from './channelSearch.component';

describe('Channel Search', () => {
  let currPathAndChannel = '';
  const onSearchChange = vi.fn();
  const createView = () => {
    return render(
      <ChannelSearch
        currPathAndChannel={currPathAndChannel}
        onSearchChange={onSearchChange}
        channels={testChannels}
      />
    );
  };

  it('should render correctly', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should call onSearchChange when option is selected and not when it is cleared', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

  it('should clear the input when currPathAndChannel no longer matches', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
