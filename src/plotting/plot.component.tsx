import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
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
import { PlotType } from '../app.types';

ChartJS.register(
  LinearScale,
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
}

const Plot = (props: PlotProps) => {
  const { data, title, type } = props;

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
          type: 'time',
        },
      },
    };
    return options;
  }, [title]);

  if (type === 'scatter')
    return <Scatter data={data as ChartData<'scatter'>} options={options} />;
  if (type === 'line')
    return <Line data={data as ChartData<'line'>} options={options} />;
  return null;
};

interface ConnectedPlotProps {
  title: string;
  type: PlotType;
}

const ConnectedPlot = (props: ConnectedPlotProps) => {
  const { title, type } = props;
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

  return <Plot data={chartData} title={title} type={type} />;
};

export default ConnectedPlot;
