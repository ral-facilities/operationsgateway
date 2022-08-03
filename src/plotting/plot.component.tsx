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
import { Scatter } from 'react-chartjs-2';
import { useRecords } from '../api/records';

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
  data: ChartData<'scatter'>;
  title: string;
}

const Plot = (props: PlotProps) => {
  const { data, title } = props;

  const options = React.useMemo(() => {
    const options: ChartOptions<'scatter'> = {
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

  return <Scatter data={data} options={options} />;
};

interface ConnectedPlotProps {
  title: string;
}

const ConnectedPlot = (props: ConnectedPlotProps) => {
  const { title } = props;
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

  return <Plot data={chartData} title={title} />;
};

export default ConnectedPlot;
