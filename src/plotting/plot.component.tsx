import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
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
  Legend
);

interface PlotProps {
  data: ChartData<'scatter'>;
}

const options: ChartOptions<'scatter'> = {
  scales: {
    x: {
      type: 'time',
    },
  },
};

const Plot = (props: PlotProps) => {
  const { data } = props;

  return <Scatter data={data} options={options} />;
};

const ConnectedPlot = () => {
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

  return <Plot data={chartData} />;
};

export default ConnectedPlot;
