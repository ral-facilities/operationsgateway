import { createTheme, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import TracePlot, { TracePlotProps } from './tracePlot.component';

describe('Trace plot component', () => {
  let props: TracePlotProps;

  beforeEach(() => {
    props = {
      trace: {
        x: [1, 2, 3],
        y: [5, 6, 4],
      },
      title: 'scatter plot',
      chartRef: React.createRef<HTMLDivElement>(),
      viewReset: false,
      pointsVisible: false,
      xUnits: 'mV',
      yUnits: 'ms',
    };
  });

  it('renders a div element with the correct attributes passed the correct props', () => {
    // emulate loading first with no data from the query and then getting data
    const { rerender, asFragment } = render(
      <TracePlot {...props} trace={{ x: [], y: [] }} />
    );

    rerender(<TracePlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with no min/max set when passed empty data', () => {
    const { asFragment } = render(
      <TracePlot {...props} trace={{ x: [], y: [] }} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly when points are set to visible & renders in dark mode correctly', () => {
    const { rerender, asFragment } = render(<TracePlot {...props} />, {
      wrapper: ({ children }) => (
        <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
          {children}
        </ThemeProvider>
      ),
    });

    rerender(<TracePlot {...props} pointsVisible />);

    expect(asFragment()).toMatchSnapshot();
  });
});
