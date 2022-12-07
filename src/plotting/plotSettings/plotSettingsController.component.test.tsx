import React from 'react';
import { render, screen } from '@testing-library/react';
import PlotSettingsController from './plotSettingsController.component';
import type { PlotSettingsControllerProps } from './plotSettingsController.component';
import userEvent from '@testing-library/user-event';
import { FullScalarChannelMetadata } from '../../app.types';
import { testChannels } from '../../setupTests';

jest.mock('./plotTitleField.component', () => (props) => (
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

jest.mock('./chartTypeButtons.component', () => (props) => (
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

jest.mock('./xAxisTab.component', () => (props) => (
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

jest.mock('./yAxisTab.component', () => (props) => (
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
  const changeYMinimum = jest.fn();
  const changeYMaximum = jest.fn();
  const changePlotTitle = jest.fn();

  const createView = () => {
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
      changeYMinimum,
      changeYMaximum,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
});
