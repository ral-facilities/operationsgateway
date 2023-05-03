import React from 'react';
import { render } from '@testing-library/react';
import { PlotProps } from './plot.component';
import { testPlotDatasets } from '../setupTests';
import Plot from './plot.component';
import { deepCopySelectedPlotChannels } from './util';

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
      XAxisScale: 'time',
      leftYAxisScale: 'linear',
      rightYAxisScale: 'logarithmic',
      XAxis: 'test x-axis',
      canvasRef: React.createRef<HTMLCanvasElement>(),
      viewReset: false,
      gridVisible: true,
      axesLabelsVisible: true,
    };
  });

  it('renders a canvas element with the correct attributes passed the correct props for a scatter plot', () => {
    const view = render(<Plot {...props} />);

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('updates options object correctly', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = [...props.selectedPlotChannels];
    newSelectedPlotChannels.forEach((dataset, i) => (dataset.units = 'mg'));

    props = {
      ...props,
      title: 'line plot',
      type: 'line',
      XAxisScale: 'linear',
      leftYAxisScale: 'logarithmic',
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

  it('updates data object correctly by setting opacity to 0 for lines that are hidden', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = deepCopySelectedPlotChannels(
      props.selectedPlotChannels
    );
    newSelectedPlotChannels[0].options.visible = false;
    props.selectedPlotChannels = newSelectedPlotChannels;
    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly by setting borderDash property on dashed lines', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = deepCopySelectedPlotChannels(
      props.selectedPlotChannels
    );
    newSelectedPlotChannels[0].options.lineStyle = 'dashed';
    props.selectedPlotChannels = newSelectedPlotChannels;
    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly by setting borderDash, pointRadius and borderCapStyle properties on dotted lines', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    const newSelectedPlotChannels = deepCopySelectedPlotChannels(
      props.selectedPlotChannels
    );
    newSelectedPlotChannels[0].options.lineStyle = 'dotted';
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
});
