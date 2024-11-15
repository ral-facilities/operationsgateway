import { render } from '@testing-library/react';
import React from 'react';
import ImagePlot, { ImagePlotProps } from './imagePlot.component';

describe('Trace plot component', () => {
  let props: ImagePlotProps;

  beforeEach(() => {
    props = {
      trace: {
        _id: 'test',
        x: [1, 2, 3],
        y: [5, 6, 4],
      },
      title: 'scatter plot',
      canvasRef: React.createRef<HTMLCanvasElement>(),
      viewReset: false,
      pointsVisible: false,
    };
  });

  it('renders a canvas element with the correct attributes passed the correct props', () => {
    // emulate loading first with no data from the query and then getting data
    const { rerender, asFragment } = render(
      <ImagePlot {...props} trace={{ _id: '0', x: [], y: [] }} />
    );

    rerender(<ImagePlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly when points are set to visible', () => {
    const { rerender, asFragment } = render(<ImagePlot {...props} />);

    rerender(<ImagePlot {...props} pointsVisible />);

    expect(asFragment()).toMatchSnapshot();
  });
});
