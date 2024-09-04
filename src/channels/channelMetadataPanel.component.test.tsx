import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { staticChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';
import { RootState } from '../state/store';
import { renderComponentWithProviders } from '../testUtils';
import ChannelMetadataPanel from './channelMetadataPanel.component';

describe('Channel Metadata Panel', () => {
  let displayedChannel: FullChannelMetadata | undefined;

  const createView = (
    initialState?: Partial<RootState>,
    queryClient?: QueryClient
  ) => {
    return renderComponentWithProviders(
      <ChannelMetadataPanel
        isChannelSelected={false}
        onSelectChannel={vi.fn()}
        onDeselectChannel={vi.fn()}
        displayedChannel={displayedChannel}
      />,
      {
        preloadedState: initialState,
        queryClient,
      }
    );
  };

  it('should render correctly for no channel selected', () => {
    displayedChannel = undefined;
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for system channel', async () => {
    displayedChannel = staticChannels['shotnum'];
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for scalar channel with units selected', async () => {
    displayedChannel = {
      name: 'Channel_ABCDE',
      systemName: 'CHANNEL_ABCDE',
      type: 'scalar',
      units: 'cm',
      path: '/test',
      description: 'Test description',
    };
    const view = createView();
    await screen.findByText('Data Summary');

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for waveform channel with units selected', async () => {
    displayedChannel = {
      systemName: 'CHANNEL_CDEFG',
      type: 'waveform',
      x_units: 'mm',
      y_units: 'J',
      path: '/test_2',
      historical: true,
    };
    const view = createView();
    await screen.findByText('Data Summary');

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should add displayed channel when add channel button is clicked', async () => {
    const user = userEvent.setup();
    const onSelectChannel = vi.fn();

    renderComponentWithProviders(
      <ChannelMetadataPanel
        isChannelSelected={false}
        onSelectChannel={onSelectChannel}
        onDeselectChannel={vi.fn()}
        displayedChannel={displayedChannel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add this channel' }));

    expect(onSelectChannel).toHaveBeenCalledWith(displayedChannel?.systemName);
  });

  it('should remove displayed channel when it is selected and when remove channel button is clicked', async () => {
    const user = userEvent.setup();
    const onDeselectChannel = vi.fn();

    renderComponentWithProviders(
      <ChannelMetadataPanel
        isChannelSelected
        onSelectChannel={vi.fn()}
        onDeselectChannel={onDeselectChannel}
        displayedChannel={displayedChannel}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove this channel' })
    );

    expect(onDeselectChannel).toHaveBeenCalledWith(
      displayedChannel?.systemName
    );
  });
});
