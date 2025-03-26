import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_WINDOW_VARS } from '../app.types';
import { WindowConfigType } from '../state/slices/windowSlice';
import { renderComponentWithProviders } from '../testUtils';
import VectorWindow from './vectorWindow.component';

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

vi.mock('./vectorPlot.component', () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { default: () => <mock-VectorPlot data-testid="mock-vector-plot" /> };
});

describe('Vector Window component', () => {
  let testVectorConfig: WindowConfigType;

  beforeEach(() => {
    testVectorConfig = {
      id: '14',
      open: true,
      type: 'vector',
      channelName: 'CHANNEL_CDEFGX',
      recordId: '14',
      title: 'Test title',
      labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label1'],
      units: 'test',
      ...DEFAULT_WINDOW_VARS,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <VectorWindow
        onClose={vi.fn()}
        vectorConfig={testVectorConfig}
        vectorWindowRef={{ current: null }}
      />
    );
  };

  it('renders vector window correctly', () => {
    createView();

    expect(screen.getByTestId('mock-vector-plot')).toBeVisible();
  });

  it('renders correctly while vector is loading', () => {
    createView();
    screen.getByLabelText('Vector loading');
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
      '14': {
        channelName: 'CHANNEL_CDEFGX',
        id: '14',
        innerHeight: 400,
        innerWidth: 600,
        labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label1'],
        open: true,
        recordId: '15',
        screenX: 200,
        screenY: 200,
        title: 'Vector CHANNEL_CDEFGX 15',
        type: 'vector',
        units: 'test',
      },
    });
  });
});
