import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_WINDOW_VARS } from '../app.types';
import { TraceOrImageWindow } from '../state/slices/windowSlice';
import { renderComponentWithProviders } from '../testUtils';
import TraceWindow from './traceWindow.component';

vi.mock('../windows/windowPortal.component', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactMock = await vi.importActual('react');
  return {
    default: ReactMock.forwardRef(({ children }, ref) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-WindowPortal>{children}</mock-WindowPortal>
    )),
  };
});

vi.mock('./tracePlot.component', () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { default: () => <mock-TracePlot data-testid="mock-trace-plot" /> };
});

describe('Trace Window component', () => {
  let testTraceConfig: TraceOrImageWindow;

  beforeEach(() => {
    testTraceConfig = {
      id: '1',
      open: true,
      type: 'trace',
      channelName: 'CHANNEL_CDEFG',
      recordId: '7',
      title: 'Test title',
      ...DEFAULT_WINDOW_VARS,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <TraceWindow onClose={vi.fn()} traceConfig={testTraceConfig} />
    );
  };

  it('renders trace window correctly', () => {
    createView();

    expect(screen.getByTestId('mock-trace-plot')).toBeVisible();
  });

  it('renders correctly while waveform is loading', () => {
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

  it('dispatches updateWindow when new thumbnail is clicked', async () => {
    const user = userEvent.setup();
    const { store } = createView();

    const thumbnails = await screen.findAllByRole('img');
    await user.click(thumbnails[1]);

    expect(store.getState().windows).toStrictEqual({
      '1': {
        id: '1',
        open: true,
        type: 'trace',
        channelName: 'CHANNEL_CDEFG',
        recordId: '8',
        title: 'Trace CHANNEL_CDEFG 8',
        ...DEFAULT_WINDOW_VARS,
      },
    });
  });
});
