import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { staticChannels } from '../../api/channels';
import { FullScalarChannelMetadata } from '../../app.types';
import { testScalarChannels } from '../../testUtils';
import type { PlotSettingsControllerProps } from './plotSettingsController.component';

describe('Plot Settings component', () => {
  let props: PlotSettingsControllerProps;
  let user: ReturnType<typeof userEvent.setup>;
  const changePlotType = vi.fn();
  const changeXAxis = vi.fn();
  const changeXAxisScale = vi.fn();
  const changeLeftYAxisScale = vi.fn();
  const changeRightYAxisScale = vi.fn();
  const changeSelectedPlotChannels = vi.fn();
  const changeXMinimum = vi.fn();
  const changeXMaximum = vi.fn();
  const changeLeftYAxisMinimum = vi.fn();
  const changeLeftYAxisMaximum = vi.fn();
  const changeRightYAxisMinimum = vi.fn();
  const changeRightYAxisMaximum = vi.fn();
  const changePlotTitle = vi.fn();

  const createView = () => {
    // need to import like this in order for the doMock's to work
    const PlotSettingsController =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./plotSettingsController.component').default;
    return render(<PlotSettingsController {...props} />);
  };

  beforeEach(() => {
    props = {
      selectedRecordTableChannels: [
        staticChannels['timestamp'] as FullScalarChannelMetadata,
      ],
      allChannels: testScalarChannels,
      changePlotTitle,
      plotType: 'scatter',
      changePlotType,
      XAxis: 'test x-axis',
      changeXAxis,
      XAxisScale: 'linear',
      changeXAxisScale,
      leftYAxisScale: 'logarithmic',
      rightYAxisScale: 'linear',
      changeLeftYAxisScale,
      changeRightYAxisScale,
      leftYAxisLabel: 'left y axis label',
      rightYAxisLabel: 'right y axis label',
      changeLeftYAxisLabel: vi.fn(),
      changeRightYAxisLabel: vi.fn(),
      selectedPlotChannels: [],
      changeSelectedPlotChannels,
      changeXMinimum,
      changeXMaximum,
      changeLeftYAxisMinimum,
      changeLeftYAxisMaximum,
      changeRightYAxisMinimum,
      changeRightYAxisMaximum,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('snapshots', () => {
    beforeAll(() => {
      jest.resetModules();
      jest.doMock('./plotSettingsTextField.component', () => (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <mock-plotSettingsTextField data-testid="mock-plotSettingsTextField">
          {Object.entries(props).map(
            ([propName, propValue]) =>
              `${propName}=${JSON.stringify(propValue, null, 2)}\n`
          )}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
        </mock-plotSettingsTextField>
      ));

      jest.doMock('./chartTypeButtons.component', () => (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <mock-chartTypeButtons data-testid="mock-chartTypeButtons">
          {Object.entries(props).map(
            ([propName, propValue]) =>
              `${propName}=${JSON.stringify(propValue, null, 2)}\n`
          )}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
        </mock-chartTypeButtons>
      ));

      jest.doMock('./xAxisTab.component', () => (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <mock-xAxisTab data-testid="mock-xAxisTab">
          {Object.entries(props).map(
            ([propName, propValue]) =>
              `${propName}=${JSON.stringify(propValue, null, 2)}\n`
          )}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
        </mock-xAxisTab>
      ));

      jest.doMock('./yAxisTab.component', () => (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <mock-yAxisTab data-testid="mock-yAxisTab">
          {Object.entries(props).map(
            ([propName, propValue]) =>
              `${propName}=${JSON.stringify(propValue, null, 2)}\n`
          )}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
        </mock-yAxisTab>
      ));
    });

    afterAll(() => {
      jest.resetModules();
      jest.dontMock('./plotSettingsTextField.component');
      jest.dontMock('./chartTypeButtons.component');
      jest.dontMock('./xAxisTab.component');
      jest.dontMock('./yAxisTab.component');
      jest.resetModules();
    });

    it('renders plot settings form correctly (timeseries plot)', () => {
      props.XAxis = 'timestamp';
      props.XAxisScale = 'time';
      const view = createView();

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders plot settings form correctly (x-axis tab selected)', () => {
      const view = createView();

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders plot settings form correctly (y-axis tab selected)', async () => {
      const view = createView();
      await user.click(screen.getByRole('tab', { name: 'Y' }));

      expect(view.asFragment()).toMatchSnapshot();
    });
  });

  it('lets user switch between X and Y settings tabs', async () => {
    createView();

    // should load X tab initially
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('X');
    expect(screen.getByRole('tabpanel', { name: 'X' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'Y' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Y');
    expect(screen.getByRole('tabpanel', { name: 'Y' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'X' })
    ).not.toBeInTheDocument();
  });

  it('sets the correct values when plot variant changed from xy to timeseries', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Timeseries' }));

    expect(changeXAxis).toHaveBeenCalledWith('timestamp');
    expect(changeXAxisScale).toHaveBeenCalledWith('time');
    expect(changeXMinimum).toHaveBeenCalledWith(undefined);
    expect(changeXMaximum).toHaveBeenCalledWith(undefined);
  });

  it('sets the correct values when plot variant changed from timeseries to xy', async () => {
    props.XAxis = 'timestamp';
    props.XAxisScale = 'time';
    createView();

    await user.click(screen.getByRole('button', { name: 'XY' }));

    expect(changeXAxis).toHaveBeenCalledWith(undefined);
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
    expect(changeXMinimum).toHaveBeenCalledWith(undefined);
    expect(changeXMaximum).toHaveBeenCalledWith(undefined);
  });
});
