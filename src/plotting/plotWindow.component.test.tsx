import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import PlotWindow from './plotWindow.component';
import userEvent from '@testing-library/user-event';
import {
  renderComponentWithProviders,
  testPlotConfigs,
  getInitialState,
} from '../setupTests';
import { PlotConfig } from '../state/slices/plotSlice';
import { RootState } from '../state/store';
import { http } from 'msw';
import { server } from '../mocks/server';

jest.mock('../windows/windowPortal.component', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactMock = require('react');
  return ReactMock.forwardRef(({ children }, ref) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <mock-WindowPortal>{children}</mock-WindowPortal>
  ));
});

jest.mock('./plot.component', () => () => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-Plot data-testid="mock-plot" />
));

describe('Plot Window component', () => {
  let testPlotConfig: PlotConfig;
  let state: RootState;

  beforeEach(() => {
    testPlotConfig = testPlotConfigs[0];
    state = {
      ...getInitialState(),
      plots: {
        ...getInitialState().plots,
        [testPlotConfig.id]: testPlotConfig,
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <PlotWindow onClose={jest.fn()} plotConfig={testPlotConfig} />,
      {
        preloadedState: state,
      }
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
    const loadingHandler = (req, res, ctx) => {
      // taken from https://github.com/mswjs/msw/issues/778 - a way of mocking pending promises without breaking jest
      return new Promise(() => undefined);
    };
    server.use(
      http.get('/records', loadingHandler),
      http.get('/channels', loadingHandler)
    );

    createView();
    screen.getByLabelText('Settings loading');
    screen.getByLabelText('Plot loading');
  });

  it('changes grid visibility button text on click', async () => {
    // testPlotConfig.gridVisible is already true

    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Hide Grid' }));
    expect(
      screen.getByRole('button', { name: 'Show Grid' })
    ).toBeInTheDocument();
  });

  it('changes axes labels visibility button text on click', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Show Axes Labels' }));
    expect(
      screen.getByRole('button', { name: 'Hide Axes Labels' })
    ).toBeInTheDocument();
  });

  it('dispatches save plot function on save button click', async () => {
    const user = userEvent.setup();
    const { store } = createView();

    // Testing that the saved plot actually updates with new state
    await user.click(screen.getByRole('button', { name: 'Show Axes Labels' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(store.getState().plots).toStrictEqual({
      [testPlotConfig.id]: expect.objectContaining({
        ...testPlotConfig,
        axesLabelsVisible: true,
      }),
    });
  });

  it('reset view button is visible and interactable', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Reset View' }));
  });
});
