import { screen } from '@testing-library/react';
import React from 'react';
import ChannelMetadataPanel from './channelMetadataPanel.component';
import { FullChannelMetadata } from '../app.types';
import { PreloadedState } from '@reduxjs/toolkit';
import { QueryClient } from '@tanstack/react-query';
import { renderComponentWithProviders } from '../setupTests';
import { RootState } from '../state/store';
import axios from 'axios';
import { ChannelSummary, staticChannels } from '../api/channels';

describe('Channel Metadata Panel', () => {
  let displayedChannel: FullChannelMetadata | undefined;
  let channelSummary: ChannelSummary;

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

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: channelSummary,
    });

    channelSummary = {
      first_date: '2022-01-31T00:00:00',
      most_recent_date: '2023-01-31T00:00:00',
      recent_sample: [
        { '2022-01-31T00:00:00': 1 },
        { '2022-01-30T00:00:00': 2 },
        { '2022-01-29T00:00:00': 3 },
      ],
    };
  });

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
      name: 'Test',
      systemName: 'test',
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
      systemName: 'test_2',
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
