import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { FullScalarChannelMetadata, Record, ScalarChannel } from '../app.types';
import ConnectedPlot, {
  ConnectedPlotProps,
  getFormattedAxisData,
  formatTooltipLabel,
} from './plot.component';
import {
  testRecords,
  renderComponentWithProviders,
  generateRecord,
  testChannels,
} from '../setupTests';

const testScalarChannels = testChannels as FullScalarChannelMetadata[];

jest.mock('victory', () => {
  const originalModule = jest.requireActual('victory');

  return {
    __esModule: true,
    ...originalModule,
    VictoryChart: (props) => (
      // @ts-ignore
      <mock-VictoryChart
        {...props}
        scale={JSON.stringify(props.scale, null, 2)}
      />
    ),
    VictoryZoomContainer: (props) => (
      // @ts-ignore
      <mock-VictoryZoomContainer {...props} />
    ),
    VictoryTheme: (props) => (
      // @ts-ignore
      <mock-VictoryTheme {...props} />
    ),
    VictoryScatter: (props) => (
      // @ts-ignore
      <mock-VictoryScatter
        {...props}
        data={JSON.stringify(props.data, null, 2)}
      />
    ),
    VictoryLine: (props) => (
      // @ts-ignore
      <mock-VictoryLine {...props} data={JSON.stringify(props.data, null, 2)} />
    ),
    VictoryLabel: (props) => (
      // @ts-ignore
      <mock-VictoryLabel {...props} />
    ),
    VictoryLegend: (props) => (
      // @ts-ignore
      <mock-VictoryLegend
        {...props}
        data={JSON.stringify(props.data, null, 2)}
      />
    ),
  };
});

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

describe('getFormattedAxisData function', () => {
  let testRecord: Record;

  beforeEach(() => {
    // record with num = 3 creates a record with a scalar channel called test_3
    // this corresponds with scalar metadata channel test_3 in testChannels variable
    testRecord = generateRecord(3);
  });

  it('formats timestamp correctly', () => {
    const unixTimestamp = Math.floor(
      new Date(testRecord.metadata.timestamp).getTime()
    );

    const result = getFormattedAxisData(
      testRecord,
      testScalarChannels,
      'timestamp'
    );
    expect(result).toEqual(unixTimestamp);
  });

  it('formats shot number correctly', () => {
    let result = getFormattedAxisData(
      testRecord,
      testScalarChannels,
      'activeExperiment'
    );
    expect(result).toEqual(testRecord.metadata.shotnum);

    testRecord.metadata.shotnum = undefined;
    result = getFormattedAxisData(testRecord, testScalarChannels, 'shotnum');
    expect(result).toEqual(NaN);
  });

  it('formats activeArea correctly', () => {
    const result = getFormattedAxisData(
      testRecord,
      testScalarChannels,
      'activeArea'
    );
    expect(result).toEqual(parseInt(testRecord.metadata.activeArea));
  });

  it('formats activeExperiment correctly', () => {
    testRecord.metadata.activeExperiment = '4';
    let result = getFormattedAxisData(
      testRecord,
      testScalarChannels,
      'activeExperiment'
    );
    expect(result).toEqual(parseInt(testRecord.metadata.activeExperiment));

    testRecord.metadata.activeExperiment = undefined;
    result = getFormattedAxisData(
      testRecord,
      testScalarChannels,
      'activeExperiment'
    );
    expect(result).toEqual(NaN);
  });

  it('formats channel data correctly', () => {
    let result = getFormattedAxisData(testRecord, testScalarChannels, 'test_3');
    expect(result).toEqual(
      (testRecord.channels['test_3'] as ScalarChannel).data
    );

    (testRecord.channels['test_3'] as ScalarChannel).data = '1';
    result = getFormattedAxisData(testRecord, testScalarChannels, 'test_3');
    expect(result).toEqual(1);

    result = getFormattedAxisData(
      testRecord,
      testScalarChannels,
      'invalid_channel'
    );
    expect(result).toEqual(NaN);
  });
});

describe('ConnectedPlot component', () => {
  let props: ConnectedPlotProps;

  const createView = () => {
    return renderComponentWithProviders(<ConnectedPlot {...props} />);
  };

  it('constructs data to insert into a Plot component', () => {
    props = {
      records: testRecords,
      channels: testScalarChannels,
      XAxis: 'timestamp',
      YAxis: 'shotnum',
      title: 'test title',
      type: 'scatter',
      XAxisSettings: {
        scale: 'time',
      },
      YAxesSettings: {
        scale: 'linear',
      },
    };

    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('inserts null points if an x or y value does not exist', () => {
    const amendedTestRecords = testRecords;
    amendedTestRecords[1].metadata.activeExperiment = undefined;
    props = {
      records: amendedTestRecords,
      channels: testScalarChannels,
      XAxis: 'activeArea',
      YAxis: 'activeExperiment',
      title: 'test title',
      type: 'scatter',
      XAxisSettings: {
        scale: 'linear',
      },
      YAxesSettings: {
        scale: 'log',
      },
    };

    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('constructs an empty dataset if we have no records available', () => {
    props = {
      records: [],
      channels: testScalarChannels,
      XAxis: 'timestamp',
      YAxis: 'shotnum',
      title: 'test title',
      type: 'line',
      XAxisSettings: {
        scale: 'time',
      },
      YAxesSettings: {
        scale: 'log',
      },
    };

    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });
});
