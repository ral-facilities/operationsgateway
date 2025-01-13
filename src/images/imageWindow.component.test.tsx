import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_WINDOW_VARS } from '../app.types';
import { TraceOrImageWindow } from '../state/slices/windowSlice';
import { renderComponentWithProviders } from '../testUtils';
import ImageWindow from './imageWindow.component';

vi.mock('../windows/windowPortal.component', async () => {
  const ReactMock = await vi.importActual('react');
  return {
    // @ts-expect-error Type wont be known due to method of import
    default: ReactMock.forwardRef(({ children }, _ref) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-WindowPortal>{children}</mock-WindowPortal>
    )),
  };
});

vi.mock('./imageView.component', () => ({
  default: () => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <mock-ImageView data-testid="mock-image-view" />
  ),
}));

vi.mock('./imagePlot.component', async () => {
  const imagePlot = await vi.importActual('./imagePlot.component');
  return {
    ...imagePlot,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    XImagePlot: () => <mock-XImagePlot data-testid="mock-x-image-plot" />,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    YImagePlot: () => <mock-YImagePlot data-testid="mock-y-image-plot" />,
  };
});

describe('Image Window component', () => {
  let testImageConfig: TraceOrImageWindow;

  beforeEach(() => {
    testImageConfig = {
      id: '1',
      open: true,
      type: 'image',
      channelName: 'CHANNEL_BCDEF',
      recordId: '4',
      title: 'Test title',
      ...DEFAULT_WINDOW_VARS,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <ImageWindow onClose={vi.fn()} imageConfig={testImageConfig} />
    );
  };

  it('renders image window correctly', () => {
    createView();

    expect(screen.getByTestId('mock-image-view')).toBeVisible();
  });

  it('renders intensity plots correctly', async () => {
    const user = userEvent.setup();
    createView();

    expect(screen.getByTestId('mock-x-image-plot')).not.toBeVisible();
    expect(screen.getByTestId('mock-y-image-plot')).not.toBeVisible();

    await user.click(
      screen.getByRole('checkbox', { name: 'Centroid / Cross Hairs' })
    );

    // use waitFor to wait for the api calls to complete
    await waitFor(() =>
      expect(screen.getByTestId('mock-x-image-plot')).toBeVisible()
    );
    expect(screen.getByTestId('mock-y-image-plot')).toBeVisible();
  });

  it('renders correctly while image is loading', () => {
    createView();
    screen.getByLabelText('Image loading');
  });

  it('reset view button is visible and interactable', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Reset View' }));
  });

  it('dispatches updateWindow when new thumbnail is clicked', async () => {
    const user = userEvent.setup();
    const { store } = createView();

    // wait for thumbnails to load
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    const images = await screen.findAllByRole('img');
    await user.click(images[1]);

    expect(store.getState().windows).toStrictEqual({
      '1': {
        id: '1',
        open: true,
        type: 'image',
        channelName: 'CHANNEL_BCDEF',
        recordId: '5',
        title: 'Image CHANNEL_BCDEF 5',
        ...DEFAULT_WINDOW_VARS,
      },
    });
  });
});
