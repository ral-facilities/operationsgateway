import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PlotConfig } from '../state/slices/plotSlice';
import { RootState } from '../state/store';
import {
  getInitialState,
  renderComponentWithProviders,
  testPlotConfigs,
} from '../testUtils';
import { WindowPortal } from '../windows/windowPortal.component';
import PlotWindow from './plotWindow.component';

vi.mock('../windows/windowPortal.component', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactMock = require('react');
  return {
    default: ReactMock.forwardRef(({ children }, ref) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-WindowPortal>{children}</mock-WindowPortal>
    )),
  };
});

vi.mock('./plot.component', () => {
  return {
    default: () => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-Plot data-testid="mock-plot" />
    ),
  };
});

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
    vi.clearAllMocks();
  });

  const createView = () => {
    const ref = React.createRef<WindowPortal>();
    return renderComponentWithProviders(
      <PlotWindow
        onClose={vi.fn()}
        plotConfig={testPlotConfig}
        plotWindowRef={ref}
      />,
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
