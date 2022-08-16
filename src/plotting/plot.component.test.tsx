import React from 'react';
import { render } from '@testing-library/react';
import { ChartData } from 'chart.js';
import { PlotType } from '../app.types';
import { Plot } from './plot.component';

// can't actually render charts in JSDom, so mock to test we're passing the right props
jest.mock('react-chartjs-2', () => ({
  Chart: (props) => (
    <canvas role="img">
      {Object.entries(props).map(
        ([propName, propValue]) =>
          `${propName}=${JSON.stringify(propValue, null, 2)}\n`
      )}
    </canvas>
  ),
}));

describe('Plot component', () => {
  const testData: ChartData<PlotType> = {
    datasets: [
      {
        label: 'Test',
        data: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 3 },
        ],
      },
    ],
  };

  it('renders a plot which passes the correct props to chart.js', () => {
    const view = render(
      <Plot
        data={testData}
        title="Test"
        type="scatter"
        XAxisSettings={{ scale: 'time' }}
        YAxesSettings={{ scale: 'linear' }}
      />
    );

    expect(view.asFragment()).toMatchSnapshot();
  });
});
