import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  LogarithmicScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  ScatterController,
  LineController,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import React from 'react';
import { Chart } from 'react-chartjs-2';
import { useRecords } from '../api/records';
import { AxisSettings, PlotType } from '../app.types';

ChartJS.register(
  LinearScale,
  LogarithmicScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  ScatterController,
  LineController
);

type FullPlotProps = {
  data: ChartData<PlotType>;
} & PlotProps;

export const Plot = (props: FullPlotProps) => {
  const { data, title, type, XAxisSettings, YAxesSettings } = props;

  const options = React.useMemo(() => {
    const options: ChartOptions<PlotType> = {
      plugins: {
        title: {
          text: title,
          display: true,
        },
      },
      scales: {
        x: {
          type: XAxisSettings.scale,
        },
        y: {
          type: YAxesSettings.scale,
        },
      },
    };
    return options;
  }, [title, XAxisSettings, YAxesSettings]);

  return (
    <Chart
      data={data}
      options={options}
      type={type}
      aria-label={`${title} plot`}
    />
  );
};

interface PlotProps {
  title: string;
  type: PlotType;
  XAxis: string;
  YAxis: string;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
}

const ConnectedPlot = (props: PlotProps) => {
  const { XAxis, YAxis } = props;
  const { data: records } = useRecords();

  const chartData: ChartData<'scatter'> = React.useMemo(() => {
    const hello =
      records?.map((record) => {
        let XAxisString = NaN;
        let YAxisString = NaN;

        if (XAxis === 'timestamp') {
          XAxisString = parseInt(record.metadata.timestamp);
        } else if (XAxis === 'shotNum') {
          XAxisString = record.metadata.shotNum ?? NaN;
        } else if (Object.keys(record.channels).includes(XAxis)) {
          const channel = record.channels[XAxis];
          XAxisString = parseInt(channel.data);
        }

        if (YAxis === 'timestamp') {
          YAxisString = parseInt(record.metadata.timestamp);
        } else if (YAxis === 'shotNum') {
          YAxisString = record.metadata.shotNum ?? NaN;
        } else if (Object.keys(record.channels).includes(YAxis)) {
          const channel = record.channels[YAxis];
          YAxisString = parseInt(channel.data);
        }

        return {
          x: XAxisString,
          y: YAxisString,
        };
      }) ?? [];

    // const data =
    //   records?.map((record) => ({
    //     x:
    //       XAxis === 'timestamp'
    //         ? parseInt(record.metadata.timestamp)
    //         : record.channels[XAxis],
    //     y: record.metadata.shotNum ?? NaN,
    //   })) ?? [];
    return {
      datasets: [
        { label: 'Shot Number', backgroundColor: '#e31a1c', data: hello },
      ],
    };
  }, [XAxis, YAxis, records]);

  return <Plot data={chartData} {...props} />;
};

export default ConnectedPlot;
