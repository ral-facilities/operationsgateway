import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { FullScalarChannelMetadata } from '../app.types';
import { PlotProps, formatTooltipLabel } from './plot.component';
import { testChannels } from '../setupTests';

describe('plotting', () => {
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
      VictoryChart: (props) => {
        mockVictoryChart(props);
        return (
          // @ts-ignore
          <mock-VictoryChart
            {...props}
            scale={JSON.stringify(props.scale, null, 2)}
          />
        );
      },
      VictoryZoomContainer: (props) => {
        mockVictoryZoomContainer(props);
        // @ts-ignore
        return <mock-VictoryZoomContainer {...props} />;
      },
      VictoryTheme: (props) => {
        mockVictoryTheme(props);
        // @ts-ignore
        return <mock-VictoryTheme {...props} />;
      },
      VictoryScatter: (props) => {
        mockVictoryScatter(props);

        return (
          // @ts-ignore
          <mock-VictoryScatter
            {...props}
            data={JSON.stringify(props.data, null, 2)}
          />
        );
      },
      VictoryLine: (props) => {
        mockVictoryLine(props);
        return (
          // @ts-ignore
          <mock-VictoryLine
            {...props}
            data={JSON.stringify(props.data, null, 2)}
          />
        );
      },
      VictoryLabel: (props) => {
        mockVictoryLabel(props);
        // @ts-ignore
        return <mock-VictoryLabel {...props} />;
      },
      VictoryLegend: (props) => {
        mockVictoryLegend(props);
        return (
          // @ts-ignore
          <mock-VictoryLegend
            {...props}
            data={JSON.stringify(props.data, null, 2)}
          />
        );
      },
      VictoryTooltip: (props) => {
        return (
          // @ts-ignore
          <mock-VictoryTooltip {...props} />
        );
      },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plot component', () => {
    let props: PlotProps;

    it('renders a scatter plot with the correct elements passed the correct props', () => {
      props = {
        data: testData,
        title: 'scatter plot',
        type: 'scatter',
        XAxisSettings: { scale: 'time' },
        YAxesSettings: { scale: 'linear' },
        XAxis: 'test x-axis',
        YAxis: 'test y-axis',
      };

      const { default: Plot } = require('./plot.component');

      render(<Plot {...props} />);

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
          x: 'test x-axis',
          y: 'test y-axis',
        })
      );
      expect(mockVictoryLine).not.toHaveBeenCalled();
    });

    it('renders a line plot with the correct elements passed the correct props', () => {
      props = {
        data: testData,
        title: 'line plot',
        type: 'line',
        XAxisSettings: { scale: 'linear' },
        YAxesSettings: { scale: 'log' },
        XAxis: 'test x-axis',
        YAxis: 'test y-axis',
      };

      const { default: Plot } = require('./plot.component');

      render(<Plot {...props} />);

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
          x: 'test x-axis',
          y: 'test y-axis',
        })
      );
      expect(mockVictoryLine).toHaveBeenCalledWith(
        expect.objectContaining({
          data: testData,
          x: 'test x-axis',
          y: 'test y-axis',
        })
      );
    });

    it('redraws the plot in response to resize events', () => {
      props = {
        data: testData,
        title: 'Test',
        type: 'scatter',
        XAxisSettings: { scale: 'time' },
        YAxesSettings: { scale: 'linear' },
        XAxis: 'test x-axis',
        YAxis: 'test y-axis',
      };

      const { default: Plot } = require('./plot.component');

      render(<Plot {...props} />);

      expect(mockVictoryChart).toHaveBeenCalledTimes(1);

      fireEvent(window, new Event('resize OperationsGateway Plot - Test'));

      // aka it rerenders (it does it twice as redraw is set to true and then reset to false again)
      expect(mockVictoryChart).toHaveBeenCalledTimes(3);
    });
  });
});

describe('formatTooltipLabel function', () => {
  it('formats timestamp correctly', () => {
    const label = 1640995200000;
    const result = formatTooltipLabel(label, 'time');
    expect(result).toEqual('2022-01-01 00:00:00:000');
  });

  it('returns the original label if scale is not time', () => {
    const label = 123456;
    const result = formatTooltipLabel(label, 'linear');
    expect(result).toEqual(label);
  });
});
