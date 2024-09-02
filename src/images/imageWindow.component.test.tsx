import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_WINDOW_VARS } from '../app.types';
import { TraceOrImageWindow } from '../state/slices/windowSlice';
import { renderComponentWithProviders } from '../testUtils';
import ImageWindow from './imageWindow.component';

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

vi.mock('./imageView.component', () => ({
  default: () => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <mock-ImageView data-testid="mock-image-view" />
  ),
}));

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
