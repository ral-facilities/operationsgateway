import React from 'react';
import { render, fireEvent } from '@testing-library/react';

describe('Plot component', () => {
  const victoryChart = jest.fn();
  const victoryZoomContainer = jest.fn();
  const victoryTheme = jest.fn();
  const victoryScatter = jest.fn();
  const victoryLine = jest.fn();
  const victoryLabel = jest.fn();
  const victoryLegend = jest.fn();

  const testData: unknown[] = [
    {
      label: 'Test',
      data: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ],
    },
  ];

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('victory', () => ({
      VictoryChart: jest.fn((props) => {
        victoryChart(props);
        return <svg role="img" {...props}></svg>;
      }),
      VictoryZoomContainer: jest.fn((props) => {
        victoryZoomContainer(props);
      }),
      VictoryTheme: jest.fn((props) => {
        victoryTheme(props);
      }),
      VictoryScatter: jest.fn((props) => {
        victoryScatter(props);
      }),
      VictoryLine: jest.fn((props) => {
        victoryLine(props);
      }),
      VictoryLabel: jest.fn((props) => {
        victoryLabel(props);
      }),
      VictoryLegend: jest.fn((props) => {
        victoryLegend(props);
      }),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a scatter plot with the correct elements passed the correct props', () => {
    const { Plot } = require('./plot.component');

    render(
      <Plot
        data={testData}
        title="scatter plot"
        type="scatter"
        XAxisSettings={{ scale: 'time' }}
        YAxesSettings={{ scale: 'linear' }}
      />
    );

    expect(victoryChart).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: { x: 'time', y: 'linear' },
      })
    );
    expect(victoryLabel).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'scatter plot',
      })
    );
    expect(victoryLegend).toHaveBeenCalled();
    expect(victoryScatter).toHaveBeenCalledWith(
      expect.objectContaining({
        data: testData,
      })
    );
    expect(victoryLine).not.toHaveBeenCalled();
  });

  it('renders a line plot with the correct elements passed the correct props', () => {
    const { Plot } = require('./plot.component');

    render(
      <Plot
        data={testData}
        title="line plot"
        type="line"
        XAxisSettings={{ scale: 'linear' }}
        YAxesSettings={{ scale: 'log' }}
      />
    );

    expect(victoryChart).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: { x: 'linear', y: 'log' },
      })
    );
    expect(victoryLabel).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'line plot',
      })
    );
    expect(victoryLegend).toHaveBeenCalled();
    expect(victoryScatter).toHaveBeenCalledWith(
      expect.objectContaining({
        data: testData,
      })
    );
    expect(victoryLine).toHaveBeenCalledWith(
      expect.objectContaining({
        data: testData,
      })
    );
  });

  // Refactor with Victory
  it.skip('redraws the plot in response to resize events', () => {
    // mock to just a mock jest function which we can then inspect the calls of
    // jest.doMock('react-chartjs-2', () => ({
    //   Chart: jest.fn(() => null),
    // }));

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

    // const { Chart } = require('react-chartjs-2');

    expect(victoryChart).toHaveBeenCalledWith(
      expect.objectContaining({ redraw: false }),
      expect.anything()
    );
    jest.clearAllMocks();

    fireEvent(window, new Event('resize OperationsGateway Plot - Test'));
    expect(victoryChart).toHaveBeenCalledWith(
      expect.objectContaining({ redraw: true }),
      expect.anything()
    );
    expect(victoryChart).toHaveBeenCalledWith(
      expect.objectContaining({ redraw: false }),
      expect.anything()
    );
  });
});
