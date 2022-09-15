import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PlotProps, formatTooltipLabel } from './plot.component';
import { testPlotDatasets } from '../setupTests';

describe('plotting', () => {
  const mockVictoryChart = jest.fn();
  const mockVictoryZoomContainer = jest.fn();
  const mockVictoryTheme = jest.fn();
  const mockVictoryScatter = jest.fn();
  const mockVictoryLine = jest.fn();
  const mockVictoryLabel = jest.fn();
  const mockVictoryLegend = jest.fn();
  const mockVictoryGroup = jest.fn();

  beforeEach(() => {
    jest.resetModules();

    /* eslint-disable @typescript-eslint/ban-ts-comment */
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
      VictoryGroup: (props) => {
        mockVictoryGroup(props);
        // @ts-ignore
        return <mock-VictoryGroup {...props} />;
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
  /* eslint-enable @typescript-eslint/ban-ts-comment */

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plot component', () => {
    let props: PlotProps;

    beforeEach(() => {
      props = {
        datasets: testPlotDatasets,
        title: 'scatter plot',
        type: 'scatter',
        XAxisSettings: { scale: 'time' },
        YAxesSettings: { scale: 'linear' },
        XAxis: 'test x-axis',
        svgRef: React.createRef<HTMLElement>(),
      };
    });

    it('renders a scatter plot with the correct elements passed the correct props', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
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
      expect(mockVictoryLegend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: testPlotDatasets.map((dataset) => {
            return { name: dataset.name, symbol: { fill: '#e31a1c' } };
          }),
        })
      );
      expect(mockVictoryScatter.mock.calls.length).toEqual(
        testPlotDatasets.length
      );
      expect(mockVictoryLine).not.toHaveBeenCalled();

      for (let i = 0; i < mockVictoryScatter.mock.calls.length; i++) {
        expect(mockVictoryScatter.mock.calls[i][0]).toEqual(
          expect.objectContaining({
            data: testPlotDatasets[i].data,
            x: 'test x-axis',
            y: testPlotDatasets[i].name,
          })
        );
      }
    });

    it('renders a line plot with the correct elements passed the correct props', () => {
      props = {
        ...props,
        title: 'line plot',
        type: 'line',
        XAxisSettings: { scale: 'linear' },
        YAxesSettings: { scale: 'log' },
      };

      // eslint-disable-next-line @typescript-eslint/no-var-requires
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
      expect(mockVictoryLegend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: testPlotDatasets.map((dataset) => {
            return { name: dataset.name, symbol: { fill: '#e31a1c' } };
          }),
        })
      );
      expect(mockVictoryScatter.mock.calls.length).toEqual(
        testPlotDatasets.length
      );
      expect(mockVictoryLine.mock.calls.length).toEqual(
        testPlotDatasets.length
      );

      for (let i = 0; i < mockVictoryScatter.mock.calls.length; i++) {
        expect(mockVictoryScatter.mock.calls[i][0]).toEqual(
          expect.objectContaining({
            data: testPlotDatasets[i].data,
            x: 'test x-axis',
            y: testPlotDatasets[i].name,
          })
        );
        expect(mockVictoryLine.mock.calls[i][0]).toEqual(
          expect.objectContaining({
            data: testPlotDatasets[i].data,
            x: 'test x-axis',
            y: testPlotDatasets[i].name,
          })
        );
      }
    });

    it('redraws the plot in response to resize events', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: Plot } = require('./plot.component');

      render(<Plot {...props} />);

      expect(mockVictoryChart).toHaveBeenCalledTimes(1);

      fireEvent(
        window,
        new Event(`resize OperationsGateway Plot - ${props.title}`)
      );

      // aka it rerenders (it does it twice as redraw is set to true and then reset to false again)
      expect(mockVictoryChart).toHaveBeenCalledTimes(3);
    });
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
