import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import PlotWindow from './plotWindow.component';
import userEvent from '@testing-library/user-event';
import {
  renderComponentWithProviders,
  testChannels,
  testPlotDatasets,
} from '../setupTests';
import { useScalarChannels } from '../api/channels';
import { usePlotRecords } from '../api/records';

jest.mock('./plotWindowPortal.component', () => ({ children }) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-PlotWindowPortal>{children}</mock-PlotWindowPortal>
));

jest.mock('./plot.component', () => () => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-Plot data-testid="mock-plot" />
));

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
    usePlotRecords: jest.fn(),
  };
});

describe('Plot Window component', () => {
  beforeEach(() => {
    jest.resetModules();

    (useScalarChannels as jest.Mock).mockReturnValue({
      data: testChannels,
      isLoading: false,
    });
    (usePlotRecords as jest.Mock).mockReturnValue({
      data: testPlotDatasets,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <PlotWindow onClose={jest.fn()} untitledTitle="untitled" />
    );
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
    expect(screen.getByTestId('mock-plot')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export Plot' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'open settings' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'open settings' }));

    // expect plot & settings panel to be visible but not settings button
    // use waitFor to account for drawer animations
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'open settings' })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('mock-plot')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export Plot' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'close settings' })
    ).toBeVisible();
  });

  it('renders correctly while records and channels are loading', () => {
    (useScalarChannels as jest.Mock).mockReturnValueOnce({
      data: [],
      isLoading: true,
    });
    (usePlotRecords as jest.Mock).mockReturnValueOnce({
      data: [],
      isLoading: true,
    });

    createView();
    screen.getByLabelText('settings-loading-indicator');
    screen.getByLabelText('plot-loading-indicator');
  });

  it('calls usePlotRecords and useScalarChannels hooks on load', () => {
    createView();
    expect(usePlotRecords).toHaveBeenCalled();
    expect(useScalarChannels).toHaveBeenCalled();
  });
});
