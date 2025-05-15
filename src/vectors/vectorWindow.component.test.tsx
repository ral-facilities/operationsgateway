import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import {
  DEFAULT_WINDOW_VARS,
  VECTOR_LIMIT_PREFERENCE_NAME,
  VECTOR_SKIP_PREFERENCE_NAME,
} from '../app.types';
import { server } from '../mocks/server';
import { WindowConfigType } from '../state/slices/windowSlice';
import { renderComponentWithProviders } from '../testUtils';
import type WindowPortal from '../windows/windowPortal.component';
import type { VectorPlotProps } from './vectorPlot.component';
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
  return {
    default: (props: VectorPlotProps) => {
      // Ensure chartRef.current is set to a valid DOM element
      if (props.chartRef && props.chartRef.current === null) {
        props.chartRef.current = document.createElement('div');
      }
      return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <mock-VectorPlot
          data-testid="mock-vector-plot"
          data-props={JSON.stringify(props)}
        />
      );
    },
  };
});

describe('Vector Window component', () => {
  let testVectorConfig: WindowConfigType;
  let user: ReturnType<typeof userEvent.setup>;
  let ref: React.RefObject<WindowPortal>;
  const mockResize = vi.fn();

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
    user = userEvent.setup();
    ref = React.createRef<WindowPortal>();
    Object.defineProperty(ref, 'current', {
      value: {
        getWindow: vi.fn(() => ({
          Plotly: {
            Plots: {
              resize: mockResize,
            },
          },
        })),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = (ref?: React.RefObject<WindowPortal>) => {
    return renderComponentWithProviders(
      <VectorWindow
        onClose={vi.fn()}
        vectorConfig={testVectorConfig}
        vectorWindowRef={ref ?? { current: null }}
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

  it('show control panel button is visible and interactive', async () => {
    createView(ref);

    await user.click(
      screen.getByRole('button', { name: 'Show Vector Controls' })
    );
    expect(
      await screen.findByRole('button', { name: 'Hide Vector Controls' })
    ).toBeVisible();

    expect(screen.getByText('Select Vector Range')).toBeVisible();
    expect(mockResize).toBeCalledTimes(1);
    expect(mockResize).toHaveBeenCalled();
  });

  it('reset view button is visible and interactable', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Reset View' }));
  });

  it('dispatches updateWindow when new thumbnail is clicked', async () => {
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

  it('checks that the vectors are using the default value of the slider (with the default vector upper bound)', async () => {
    // Mock vector preferences

    server.use(
      http.get(`/users/preferences/${VECTOR_SKIP_PREFERENCE_NAME}`, () => {
        return HttpResponse.json('2', { status: 200 });
      }),
      http.get(`/users/preferences/${VECTOR_LIMIT_PREFERENCE_NAME}`, () => {
        return HttpResponse.json('5', { status: 200 });
      })
    );

    const { asFragment } = createView(ref);
    await user.click(
      screen.getByRole('button', { name: 'Show Vector Controls' })
    );

    expect(screen.getByText('Select Vector Range')).toBeVisible();

    const slider = await screen.findAllByRole('slider');
    await waitFor(() => {
      expect(slider[0]).toHaveValue('2');
    });
    expect(slider[1]).toHaveValue('5');

    expect(asFragment()).toMatchSnapshot();
  });
});
