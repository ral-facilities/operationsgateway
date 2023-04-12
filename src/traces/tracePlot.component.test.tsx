import React from 'react';
import { render } from '@testing-library/react';
import { TracePlotProps } from './tracePlot.component';
import TracePlot from './tracePlot.component';

describe('Trace plot component', () => {
  let props: TracePlotProps;

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
      <TracePlot {...props} trace={{ _id: '0', x: [], y: [] }} />
    );

    rerender(<TracePlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly when points are set to visible', () => {
    const { rerender, asFragment } = render(<TracePlot {...props} />);

    rerender(<TracePlot {...props} pointsVisible />);

    expect(asFragment()).toMatchSnapshot();
  });
});
