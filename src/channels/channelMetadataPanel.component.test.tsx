import { screen } from '@testing-library/react';
import React from 'react';
import ChannelMetadataPanel from './channelMetadataPanel.component';
import { FullChannelMetadata } from '../app.types';
import { PreloadedState } from '@reduxjs/toolkit';
import { QueryClient } from '@tanstack/react-query';
import { renderComponentWithProviders } from '../setupTests';
import { RootState } from '../state/store';
import { staticChannels } from '../api/channels';

describe('Channel Metadata Panel', () => {
  let displayedChannel: FullChannelMetadata | undefined;

  const createView = (
    initialState?: PreloadedState<RootState>,
    queryClient?: QueryClient
  ) => {
    return renderComponentWithProviders(
      <ChannelMetadataPanel displayedChannel={displayedChannel} />,
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
});
