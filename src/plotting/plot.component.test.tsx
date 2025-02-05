import { render } from '@testing-library/react';
import React from 'react';
import { testPlotDatasets } from '../testUtils';
import Plot, { PlotProps } from './plot.component';
import { deepCopySelectedPlotChannels } from './util';
import { createTheme, ThemeProvider } from '@mui/material';
import { timeChannelName } from '../app.types';

describe('Plot component', () => {
  let props: PlotProps;

  beforeEach(() => {
    props = {
      datasets: testPlotDatasets,
      selectedPlotChannels: testPlotDatasets.map((dataset, i) => ({
        name: dataset.name,
        units: '',
        options: {
          visible: true,
          colour: `colour-${i.toString()}`,
          lineStyle: 'solid',
          yAxis: 'left',
        },
      })),
      title: 'scatter plot',
      type: 'scatter',
      XAxisScale: 'date',
      leftYAxisScale: 'linear',
      rightYAxisScale: 'log',
      XAxis: timeChannelName,
      chartRef: React.createRef<HTMLDivElement>(),
      viewReset: false,
      gridVisible: true,
      axesLabelsVisible: true,
    };
  });

  it('renders a div element with the correct attributes passed the correct props for a scatter plot', () => {
    const view = render(<Plot {...props} />, {
      // render in darkmode to test darkmode colours are set correctly
      wrapper: ({ children }) => (
        <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
          {children}
        </ThemeProvider>
      ),
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('updates layout and data options correctly (linear axes)', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = [...props.selectedPlotChannels];
    newSelectedPlotChannels.forEach((dataset) => (dataset.units = 'mg'));

    props = {
      ...props,
      title: 'line plot',
      type: 'line',
      XAxisScale: 'linear',
      leftYAxisScale: 'linear',
      rightYAxisScale: 'linear',
      XAxis: 'new test x-axis',
      viewReset: true,
      gridVisible: false,
      axesLabelsVisible: false,
      xMinimum: 10,
      xMaximum: 20,
      leftYAxisMinimum: 30,
      leftYAxisMaximum: 40,
      rightYAxisMinimum: 50,
      rightYAxisMaximum: 60,
      selectedPlotChannels: newSelectedPlotChannels,
    };

    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates layout and data object correctly (log axes)', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = [...props.selectedPlotChannels];
    newSelectedPlotChannels.forEach((dataset) => (dataset.units = 'mg'));

    props = {
      ...props,
      title: 'line plot',
      XAxisScale: 'log',
      leftYAxisScale: 'log',
      rightYAxisScale: 'log',
      XAxis: 'new test x-axis',
      viewReset: true,
      gridVisible: false,
      axesLabelsVisible: false,
      xMinimum: 10,
      xMaximum: 20,
      leftYAxisMinimum: 30,
      leftYAxisMaximum: 40,
      rightYAxisMinimum: 50,
      rightYAxisMaximum: 60,
      selectedPlotChannels: newSelectedPlotChannels,
    };

    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly when changing the line & marker style options', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = deepCopySelectedPlotChannels(
      props.selectedPlotChannels
    );
    newSelectedPlotChannels[0].options.markerStyle = 'star';
    newSelectedPlotChannels[0].options.markerSize = 10;
    newSelectedPlotChannels[0].options.lineStyle = 'dashdot';
    newSelectedPlotChannels[0].options.lineWidth = 5;
    newSelectedPlotChannels[0].options.colour = 'magenta';

    props.selectedPlotChannels = newSelectedPlotChannels;
    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly by setting opacity to 0 for lines that are hidden & setting marker style to false', () => {
    props.type = 'line';
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = deepCopySelectedPlotChannels(
      props.selectedPlotChannels
    );
    newSelectedPlotChannels[0].options.markerStyle = false;
    newSelectedPlotChannels[0].options.visible = false;
    props.selectedPlotChannels = newSelectedPlotChannels;
    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly by setting the y axis correctly for right Y axis selected channels', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = [...props.selectedPlotChannels];
    newSelectedPlotChannels[0].options.yAxis = 'right';
    props.selectedPlotChannels = newSelectedPlotChannels;
    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly when XAxis is not set (aka when user switches from timeseries to XY plot)', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    props.XAxis = undefined;
    props.XAxisScale = 'linear';
    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
