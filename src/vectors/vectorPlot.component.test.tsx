import { createTheme, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import VectorPlot, { type VectorPlotProps } from './vectorPlot.component';

describe('Vector plot component', () => {
  let props: VectorPlotProps;

  beforeEach(() => {
    props = {
      vector: { data: [1, 2, 3, 4, 5, 6] },
      labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label1'],
      units: 'test',
      title: 'bar plot',
      chartRef: React.createRef<HTMLDivElement>(),
      viewReset: false,
    };
  });

  it('renders a div element with the correct attributes passed the correct props', () => {
    // emulate loading first with no data from the query and then getting data
    const { rerender, asFragment } = render(
      <VectorPlot
        {...props}
        vector={{ data: [] }}
        labels={[]}
        units={undefined}
      />
    );

    rerender(<VectorPlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('updates data object correctly when points are set to visible & renders in dark mode correctly', () => {
    const { rerender, asFragment } = render(<VectorPlot {...props} />, {
      wrapper: ({ children }) => (
        <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
          {children}
        </ThemeProvider>
      ),
    });

    rerender(<VectorPlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
