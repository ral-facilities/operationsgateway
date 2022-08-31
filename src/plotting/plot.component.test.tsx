import React from 'react';
import { render } from '@testing-library/react';
import { ChartData } from 'chart.js';
import {
  FullScalarChannelMetadata,
  PlotType,
  Record,
  ScalarChannel,
} from '../app.types';
import ConnectedPlot, {
  ConnectedPlotProps,
  Plot,
  getFormattedAxisData,
} from './plot.component';
import {
  testRecords,
  renderComponentWithProviders,
  generateRecord,
  testChannels,
} from '../setupTests';

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

const testScalarChannels = testChannels as FullScalarChannelMetadata[];

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
        scale: 'logarithmic',
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
        scale: 'logarithmic',
      },
    };

    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });
});
