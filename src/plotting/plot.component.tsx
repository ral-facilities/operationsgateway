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
  const [redraw, setRedraw] = React.useState(false);
  const setRedrawTrue = React.useCallback(() => {
    setRedraw(true);
  }, [setRedraw]);

  React.useEffect(() => {
    window.addEventListener(
      `resize OperationsGateway Plot - ${title}`,
      setRedrawTrue,
      false
    );
    return () => {
      window.removeEventListener(
        `resize OperationsGateway Plot - ${title}`,
        setRedrawTrue,
        false
      );
    };
  }, [setRedrawTrue, title]);

  // reset redraw state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (redraw) {
      setRedraw(false);
    }
  });

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
      maintainAspectRatio: false,
      responsive: true,
    };
    return options;
  }, [title, XAxisSettings, YAxesSettings]);

  return (
    <Chart
      data={data}
      options={options}
      type={type}
      aria-label={`${title} plot`}
      redraw={redraw}
    />
  );
};

interface PlotProps {
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
}

const ConnectedPlot = (props: PlotProps) => {
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
    <div
      className="chart-container"
      style={{ position: 'relative', height: '100%', width: '100%' }}
    >
      <Plot data={chartData} {...props} />
    </div>
  );
};

export default ConnectedPlot;
