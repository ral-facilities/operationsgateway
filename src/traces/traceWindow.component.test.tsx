import React from 'react';
import { screen } from '@testing-library/react';
import TraceWindow from './traceWindow.component';
import userEvent from '@testing-library/user-event';
import { renderComponentWithProviders } from '../setupTests';
import { rest } from 'msw';
import { server } from '../mocks/server';
import { TraceOrImageWindow } from '../state/slices/windowSlice';
import { DEFAULT_WINDOW_VARS } from '../app.types';

jest.mock('../windows/windowPortal.component', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactMock = require('react');
  return ReactMock.forwardRef(({ children }, ref) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <mock-WindowPortal>{children}</mock-WindowPortal>
  ));
});

jest.mock('./tracePlot.component', () => () => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-TracePlot data-testid="mock-trace-plot" />
));

describe('Trace Window component', () => {
  let testTraceConfig: TraceOrImageWindow;

  beforeEach(() => {
    testTraceConfig = {
      open: true,
      type: 'trace',
      channelName: 'TEST',
      recordId: '1',
      title: 'Test title',
      ...DEFAULT_WINDOW_VARS,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <TraceWindow onClose={jest.fn()} traceConfig={testTraceConfig} />
    );
  };

  it('renders trace window correctly', () => {
    createView();

    expect(screen.getByTestId('mock-trace-plot')).toBeVisible();
  });

  it('renders correctly while waveform is loading', () => {
    const loadingHandler = (req, res, ctx) => {
      // taken from https://github.com/mswjs/msw/issues/778 - a way of mocking pending promises without breaking jest
      return new Promise(() => undefined);
    };
    server.use(rest.get('/waveforms', loadingHandler));

    createView();
    screen.getByLabelText('Trace loading');
  });

  it('changes points visibility button text on click', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Show Points' }));
    expect(
      screen.getByRole('button', { name: 'Hide Points' })
    ).toBeInTheDocument();
  });

  it('reset view button is visible and interactable', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Reset View' }));
  });
});
