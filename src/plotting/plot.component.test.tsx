import React from 'react';
import { render, fireEvent } from '@testing-library/react';

describe('Plot component', () => {
  const mockVictoryChart = jest.fn();
  const mockVictoryZoomContainer = jest.fn();
  const mockVictoryTheme = jest.fn();
  const mockVictoryScatter = jest.fn();
  const mockVictoryLine = jest.fn();
  const mockVictoryLabel = jest.fn();
  const mockVictoryLegend = jest.fn();

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
        mockVictoryChart(props);
        // @ts-ignore
        return <mock-VictoryChart {...props} />;
      }),
      VictoryZoomContainer: jest.fn((props) => {
        mockVictoryZoomContainer(props);
        // @ts-ignore
        return <mock-VictoryZoomContainer {...props} />;
      }),
      VictoryTheme: jest.fn((props) => {
        mockVictoryTheme(props);
        // @ts-ignore
        return <mock-VictoryTheme {...props} />;
      }),
      VictoryScatter: jest.fn((props) => {
        mockVictoryScatter(props);
        // @ts-ignore
        return <mock-VictoryScatter {...props} />;
      }),
      VictoryLine: jest.fn((props) => {
        mockVictoryLine(props);
        // @ts-ignore
        return <mock-VictoryLine {...props} />;
      }),
      VictoryLabel: jest.fn((props) => {
        mockVictoryLabel(props);
        // @ts-ignore
        return <mock-VictoryLabel {...props} />;
      }),
      VictoryLegend: jest.fn((props) => {
        mockVictoryLegend(props);
        // @ts-ignore
        return <mock-VictoryLegend {...props} />;
      }),
      VictoryTooltip: jest.fn((props) => {
        // @ts-ignore
        return <mock-VictoryTooltip {...props} />;
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

    expect(mockVictoryChart).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: { x: 'time', y: 'linear' },
      })
    );
    expect(mockVictoryLabel).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'scatter plot',
      })
    );
    expect(mockVictoryLegend).toHaveBeenCalled();
    expect(mockVictoryScatter).toHaveBeenCalledWith(
      expect.objectContaining({
        data: testData,
      })
    );
    expect(mockVictoryLine).not.toHaveBeenCalled();
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

    expect(mockVictoryChart).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: { x: 'linear', y: 'log' },
      })
    );
    expect(mockVictoryLabel).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'line plot',
      })
    );
    expect(mockVictoryLegend).toHaveBeenCalled();
    expect(mockVictoryScatter).toHaveBeenCalledWith(
      expect.objectContaining({
        data: testData,
      })
    );
    expect(mockVictoryLine).toHaveBeenCalledWith(
      expect.objectContaining({
        data: testData,
      })
    );
  });

  it('redraws the plot in response to resize events', () => {
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

    expect(mockVictoryChart).toHaveBeenCalledTimes(1);

    fireEvent(window, new Event('resize OperationsGateway Plot - Test'));

    // aka it rerenders (it does it twice as redraw is set to true and then reset to false again)
    expect(mockVictoryChart).toHaveBeenCalledTimes(3);
  });
});
