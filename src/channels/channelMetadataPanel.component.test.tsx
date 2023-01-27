import { render } from '@testing-library/react';
import React from 'react';
import ChannelMetadataPanel from './channelMetadataPanel.component';
import { FullChannelMetadata } from '../app.types';

describe('Channel Metadata Panel', () => {
  let displayedChannel: FullChannelMetadata | undefined;
  const createView = () => {
    return render(<ChannelMetadataPanel displayedChannel={displayedChannel} />);
  };

  it('should render correctly for no channel selected', () => {
    displayedChannel = undefined;
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for scalar channel with units selected', () => {
    displayedChannel = {
      name: 'Test',
      systemName: 'test',
      type: 'scalar',
      units: 'cm',
      path: '/test',
      description: 'Test description',
    };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for waveform channel with units selected', () => {
    displayedChannel = {
      systemName: 'test_2',
      type: 'waveform',
      x_units: 'mm',
      y_units: 'J',
      path: '/test_2',
      historical: true,
    };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
