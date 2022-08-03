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
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import React from 'react';
import { Scatter, Line } from 'react-chartjs-2';
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
  Title
);

interface PlotProps {
  data: ChartData<PlotType>;
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
}

const Plot = (props: PlotProps) => {
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

  if (type === 'scatter')
    return <Scatter data={data as ChartData<'scatter'>} options={options} />;
  if (type === 'line')
    return <Line data={data as ChartData<'line'>} options={options} />;
  return null;
};

interface ConnectedPlotProps {
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
}

const ConnectedPlot = (props: ConnectedPlotProps) => {
  const { title, type, XAxisSettings, YAxesSettings } = props;
  const { data: records } = useRecords();

  const chartData: ChartData<'scatter'> = React.useMemo(() => {
    const data =
      records?.map((record) => ({
        x: parseInt(record.metadata.timestamp),
        y: record.metadata.shotNum ?? NaN,
      })) ?? [];
    return {
      datasets: [{ label: 'Shot Number', backgroundColor: '#e31a1c', data }],
    };
  }, [records]);

  return (
    <Plot
      data={chartData}
      title={title}
      type={type}
      XAxisSettings={XAxisSettings}
      YAxesSettings={YAxesSettings}
    />
  );
};

export default ConnectedPlot;
