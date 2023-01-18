import React from 'react';
import { render, screen } from '@testing-library/react';
import type { PlotSettingsControllerProps } from './plotSettingsController.component';
import userEvent from '@testing-library/user-event';
import { FullScalarChannelMetadata } from '../../app.types';
import { testChannels } from '../../setupTests';

describe('Plot Settings component', () => {
  let props: PlotSettingsControllerProps;
  let user;
  const changePlotType = jest.fn();
  const changeXAxis = jest.fn();
  const changeXAxisScale = jest.fn();
  const changeLeftYAxisScale = jest.fn();
  const changeRightYAxisScale = jest.fn();
  const changeSelectedPlotChannels = jest.fn();
  const changeXMinimum = jest.fn();
  const changeXMaximum = jest.fn();
  const changeLeftYAxisMinimum = jest.fn();
  const changeLeftYAxisMaximum = jest.fn();
  const changeRightYAxisMinimum = jest.fn();
  const changeRightYAxisMaximum = jest.fn();
  const changePlotTitle = jest.fn();

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
        {
          systemName: 'timestamp',
          channel_dtype: 'scalar',
          userFriendlyName: 'Time',
        },
      ],
      allChannels: testChannels as FullScalarChannelMetadata[],
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
    jest.clearAllMocks();
  });

  describe('snapshots', () => {
    beforeAll(() => {
      jest.resetModules();
      jest.doMock('./plotTitleField.component', () => (props) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <mock-plotTitleField data-testid="mock-plotTitleField">
          {Object.entries(props).map(
            ([propName, propValue]) =>
              `${propName}=${JSON.stringify(propValue, null, 2)}\n`
          )}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
        </mock-plotTitleField>
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
      jest.dontMock('./plotTitleField.component');
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

  it('sets the correct values when plot variant changed between timeseries and xy', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Timeseries' }));

    expect(changeXAxis).toHaveBeenCalledWith('timestamp');
    expect(changeXAxisScale).toHaveBeenCalledWith('time');
    expect(changeXMinimum).toHaveBeenCalledWith(undefined);
    expect(changeXMaximum).toHaveBeenCalledWith(undefined);

    jest.clearAllMocks();

    await user.click(screen.getByRole('button', { name: 'XY' }));

    expect(changeXAxis).toHaveBeenCalledWith(undefined);
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
    expect(changeXMinimum).toHaveBeenCalledWith(undefined);
    expect(changeXMaximum).toHaveBeenCalledWith(undefined);
  });
});
