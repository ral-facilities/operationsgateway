import React from 'react';
import { render } from '@testing-library/react';
import { PlotProps, formatTooltipLabel } from './plot.component';
import { testPlotDatasets } from '../setupTests';
import { SelectedPlotChannel } from '../app.types';
import Plot from './plot.component';

describe('Plot component', () => {
  let props: PlotProps;

  const selectedChannels: SelectedPlotChannel[] = testPlotDatasets.map(
    (dataset) => {
      return {
        name: dataset.name,
        options: {
          visible: true,
        },
      };
    }
  );

  beforeEach(() => {
    props = {
      datasets: testPlotDatasets,
      selectedChannels,
      title: 'scatter plot',
      type: 'scatter',
      XAxisSettings: { scale: 'time' },
      YAxesSettings: { scale: 'linear' },
      XAxis: 'test x-axis',
      canvasRef: React.createRef<HTMLCanvasElement>(),
    };
  });

  it('renders a canvas element with the correct attributes passed the correct props for a scatter plot', () => {
    const view = render(<Plot {...props} />);

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('updates options object correctly', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    props = {
      ...props,
      title: 'line plot',
      type: 'line',
      XAxisSettings: { scale: 'linear' },
      YAxesSettings: { scale: 'log' },
    };

    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly by settings opacity to 0 for lines that are hidden', () => {
    const { rerender, asFragment } = render(<Plot {...props} />);

    props.selectedChannels = [...selectedChannels];
    props.selectedChannels[0].options.visible = false;

    rerender(<Plot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('formatTooltipLabel function', () => {
  it('formats timestamp correctly', () => {
    const label = 1640995200000;
    const result = formatTooltipLabel(label, 'time');
    expect(result).toEqual('2022-01-01 00:00:00');
  });

  it('returns the original label if it is not a date', () => {
    const label = 123456;
    const result = formatTooltipLabel(label, 'linear');
    expect(result).toEqual(label);
  });
});
