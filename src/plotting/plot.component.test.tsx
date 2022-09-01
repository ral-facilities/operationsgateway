import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ChartData } from 'chart.js';
import { PlotType } from '../app.types';

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

  beforeEach(() => {
    jest.resetModules();
  });

  // Refactor with Victory
  it.skip('renders a plot which passes the correct props to chart.js', () => {
    // can't actually render charts in JSDom, so mock to test we're passing the right props
    jest.doMock('react-chartjs-2', () => ({
      Chart: jest.fn((props) => {
        return (
          <canvas role="img">
            {Object.entries(props).map(
              ([propName, propValue]) =>
                `${propName}=${JSON.stringify(propValue, null, 2)}\n`
            )}
          </canvas>
        );
      }),
    }));

    const { Plot } = require('./plot.component');

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

  // Refactor with Victory
  it.skip('redraws the plot in response to resize events', () => {
    // mock to just a mock jest function which we can then inspect the calls of
    jest.doMock('react-chartjs-2', () => ({
      Chart: jest.fn(() => null),
    }));

    const { Plot } = require('./plot.component');

    render(
      <Plot
        data={testData}
        title="Test"
        type="scatter"
        XAxisSettings={{ scale: 'time' }}
        YAxesSettings={{ scale: 'linear' }}
      />
    );

    const { Chart } = require('react-chartjs-2');

    expect(Chart).toHaveBeenCalledWith(
      expect.objectContaining({ redraw: false }),
      expect.anything()
    );
    jest.clearAllMocks();

    fireEvent(window, new Event('resize OperationsGateway Plot - Test'));
    expect(Chart).toHaveBeenCalledWith(
      expect.objectContaining({ redraw: true }),
      expect.anything()
    );
    expect(Chart).toHaveBeenCalledWith(
      expect.objectContaining({ redraw: false }),
      expect.anything()
    );
  });
});
