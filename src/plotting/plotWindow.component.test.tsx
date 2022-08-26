import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import PlotWindow from './plotWindow.component';
import userEvent from '@testing-library/user-event';
import {
  renderComponentWithProviders,
  testChannels,
  testRecords,
} from '../setupTests';
import { useScalarChannels } from '../api/channels';
import { useRecords } from '../api/records';
import { FullScalarChannelMetadata } from '../app.types';

// need to mock to avoid errors
jest.mock('react-chartjs-2', () => ({
  Chart: (props) => <canvas role="img" {...props} />,
}));

jest.mock('../api/channels', () => {
  const originalModule = jest.requireActual('../api/channels');

  return {
    __esModule: true,
    ...originalModule,
    useScalarChannels: jest.fn(),
  };
});

jest.mock('../api/records', () => {
  const originalModule = jest.requireActual('../api/records');

  return {
    __esModule: true,
    ...originalModule,
    useRecords: jest.fn(),
  };
});

describe('Plot Window component', () => {
  beforeEach(() => {
    (useScalarChannels as jest.Mock).mockReturnValue({
      data: testChannels as FullScalarChannelMetadata[],
      isLoading: false,
    });
    (useRecords as jest.Mock).mockReturnValue({
      data: testRecords,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(<PlotWindow />);
  };

  it('renders plot window correctly with settings pane both open and closed', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'close settings' }));

    // expect plot & settings button to be visible but not settings panel
    // use waitFor to account for drawer animations
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'close settings' })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('img', { name: 'plot' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'open settings' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'open settings' }));

    // expect plot & settings panel to be visible but not settings button
    // use waitFor to account for drawer animations
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'open settings' })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('img', { name: 'plot' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'close settings' })
    ).toBeVisible();
  });

  it('renders correctly while records and channels are loading', () => {
    (useScalarChannels as jest.Mock).mockReturnValueOnce({
      data: [],
      isLoading: true,
    });
    (useRecords as jest.Mock).mockReturnValueOnce({
      data: [],
      isLoading: true,
    });

    createView();
    screen.getByLabelText('settings-loading-indicator');
    screen.getByLabelText('plot-loading-indicator');
  });

  it('calls useRecords and useScalarChannels hooks on load', () => {
    createView();
    expect(useRecords).toHaveBeenCalled();
    expect(useScalarChannels).toHaveBeenCalled();
  });
});
