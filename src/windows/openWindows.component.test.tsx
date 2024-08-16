import { DEFAULT_WINDOW_VARS } from '../app.types';
import { RootState } from '../state/store';
import {
  getInitialState,
  renderComponentWithStoreAndWindows,
  testPlotConfigs,
} from '../testUtils';
import OpenWindows from './openWindows.component';

// need to mock to avoid errors
vi.mock('../plotting/plotWindow.component', () => {
  return {
    default: (props) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-plotWindow data-testid="mock-plotWindow">
        {Object.entries(props).map(
          ([propName, propValue]) =>
            `${propName}=${JSON.stringify(propValue, null, 2)}\n`
        )}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
      </mock-plotWindow>
    ),
  };
});

// need to mock to avoid errors
vi.mock('../traces/traceWindow.component', () => {
  return {
    default: (props) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-traceWindow data-testid="mock-traceWindow">
        {Object.entries(props).map(
          ([propName, propValue]) =>
            `${propName}=${JSON.stringify(propValue, null, 2)}\n`
        )}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
      </mock-traceWindow>
    ),
  };
});

// need to mock to avoid errors
vi.mock('../images/imageWindow.component', () => {
  return {
    default: (props) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-imageWindow data-testid="mock-imageWindow">
        {Object.entries(props).map(
          ([propName, propValue]) =>
            `${propName}=${JSON.stringify(propValue, null, 2)}\n`
        )}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
      </mock-imageWindow>
    ),
  };
});

const windowsRef: React.MutableRefObject<WindowsRefType | null> =
  React.createRef();

describe('Open Windows component', () => {
  let state: RootState;

  const createView = (initialState = state) => {
    return renderComponentWithStoreAndWindows(<OpenWindows />, {
      preloadedState: initialState,
      windowsRef,
    });
  };

  beforeEach(() => {
    state = getInitialState();
  });

  it('renders windows for each open window', async () => {
    state.plots = {
      [testPlotConfigs[0].id]: testPlotConfigs[0],
      [testPlotConfigs[1].id]: testPlotConfigs[1],
      [testPlotConfigs[2].id]: testPlotConfigs[2],
    };
    state.windows = {
      trace_window: {
        id: 'trace_window',
        open: true,
        type: 'trace',
        recordId: '1',
        channelName: 'TEST',
        title: 'Trace TEST 1',
        ...DEFAULT_WINDOW_VARS,
      },
      image_window: {
        id: 'image_window',
        open: true,
        type: 'image',
        recordId: '1',
        channelName: 'TEST',
        title: 'Image TEST 1',
        ...DEFAULT_WINDOW_VARS,
      },
    };
    const view = createView();

    // We expect Plot 0 and Plot 2 to be in the screenshot. Plot 1 has open: false
    expect(view.asFragment()).toMatchSnapshot();

    expect(windowsRef.current).toStrictEqual({
      'test-plot-id-0': { current: null },
      'test-plot-id-2': { current: null },
      trace_window: { current: null },
      image_window: { current: null },
    });
  });
});
