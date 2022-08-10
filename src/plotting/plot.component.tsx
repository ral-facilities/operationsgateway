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
    const data =
      records?.map((record) => {
        let formattedXAxis = NaN;
        let formattedYAxis = NaN;

        switch (XAxis) {
          case 'timestamp':
            formattedXAxis = parseInt(record.metadata.timestamp);
            break;
          case 'shotNum':
            formattedXAxis = record.metadata.shotNum ?? NaN;
            break;
          case 'activeArea':
            formattedXAxis = parseInt(record.metadata.activeArea);
            break;
          case 'activeExperiment':
            formattedXAxis = parseInt(record.metadata.activeExperiment ?? '');
            break;
          default:
            if (Object.keys(record.channels).includes(XAxis)) {
              const channel = record.channels[XAxis];
              formattedXAxis = parseInt(channel.data);
            }
        }

        switch (YAxis) {
          case 'timestamp':
            formattedYAxis = parseInt(record.metadata.timestamp);
            break;
          case 'shotNum':
            formattedYAxis = record.metadata.shotNum ?? NaN;
            break;
          case 'activeArea':
            formattedYAxis = parseInt(record.metadata.activeArea);
            break;
          case 'activeExperiment':
            formattedYAxis = parseInt(record.metadata.activeExperiment ?? '');
            break;
          default:
            if (Object.keys(record.channels).includes(YAxis)) {
              const channel = record.channels[YAxis];
              formattedYAxis = parseInt(channel.data);
            }
        }

        return {
          x: formattedXAxis,
          y: formattedYAxis,
        };
      }) ?? [];
    return {
      datasets: [{ label: 'Shot Number', backgroundColor: '#e31a1c', data }],
    };
  }, [XAxis, YAxis, records]);

  return <Plot data={chartData} {...props} />;
};

export default ConnectedPlot;
