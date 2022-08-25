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
import { AxisSettings, PlotType, Record } from '../app.types';

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

interface PlotProps {
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
}

export const Plot = (props: { data: ChartData<PlotType> } & PlotProps) => {
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

export const getFormattedAxisData = (
  record: Record,
  axisName: string
): number => {
  let formattedData = NaN;

  switch (axisName) {
    case 'timestamp':
      formattedData = new Date(record.metadata.timestamp).getTime();
      break;
    case 'shotNum':
      formattedData = record.metadata.shotNum ?? NaN;
      break;
    case 'activeArea':
      formattedData = parseInt(record.metadata.activeArea);
      break;
    case 'activeExperiment':
      formattedData = record.metadata.activeExperiment
        ? parseInt(record.metadata.activeExperiment)
        : NaN;
      break;
    default:
      if (Object.keys(record.channels).includes(axisName)) {
        const channel = record.channels[axisName];
        formattedData = parseFloat(channel.data);
      }
  }

  return formattedData;
};

export type ConnectedPlotProps = {
  records: Record[];
  XAxis: string;
  YAxis: string;
} & PlotProps;

const ConnectedPlot = (props: ConnectedPlotProps) => {
  const { XAxis, YAxis, records } = props;

  const chartData: ChartData<PlotType> = React.useMemo(() => {
    const data =
      records?.map((record) => {
        const formattedXAxis = getFormattedAxisData(record, XAxis);
        const formattedYAxis = getFormattedAxisData(record, YAxis);

        // If no valid x or y value, we have no point to plot
        if (!formattedXAxis || !formattedYAxis) return { x: NaN, y: NaN };

        return {
          x: formattedXAxis,
          y: formattedYAxis,
        };
      }) ?? [];
    return {
      datasets: [{ label: YAxis, backgroundColor: '#e31a1c', data }],
    };
  }, [XAxis, YAxis, records]);

  return (
    <Plot
      data={chartData}
      title={props.title}
      type={props.type}
      XAxisSettings={props.XAxisSettings}
      YAxesSettings={props.YAxesSettings}
    />
  );
};

export default ConnectedPlot;
