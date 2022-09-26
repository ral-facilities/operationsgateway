import React from 'react';
import {
  XAxisSettings,
  PlotDataset,
  PlotType,
  YAxisSettings,
  SelectedPlotChannel,
} from '../app.types';
import { format } from 'date-fns';

export const formatTooltipLabel = (
  label: number,
  scale: XAxisSettings['scale']
): number | string => {
  if (scale === 'time') {
    return format(label, 'yyyy-MM-dd HH:mm:ss');
  }
  return label;
};

const labels = [1, 2, 3, 4, 5, 6, 7];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [-655, -752, 696, 222, 789, -251, -643],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      yAxisID: 'y',
    },
    {
      label: 'Dataset 2',
      data: [5506056, 6237210, 5421636, 7190345, 9040798, 5487210, 9631115],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y1',
    },
  ],
};

export interface PlotProps {
  datasets: PlotDataset[];
  selectedChannels: SelectedPlotChannel[];
  title: string;
  type: PlotType;
  XAxisSettings: XAxisSettings;
  YAxesSettings: YAxisSettings;
  XAxis: string;
  svgRef: React.MutableRefObject<HTMLElement | null>;
}

const Plot = (props: PlotProps) => {
  const {
    // datasets,
    // selectedChannels,
    title,
    // type,
    // XAxisSettings,
    // YAxesSettings,
    // XAxis,
    // svgRef,
  } = props;

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [optionsString, setOptionsString] = React.useState('');
  const [dataString, setDataString] = React.useState('');

  React.useEffect(() => {
    const optionsString = JSON.stringify({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: title,
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            drag: {
              enabled: false,
            },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            mode: 'xy',
          },
        },
      },
      datasets: { scatter: { showLine: true } },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    });
    setOptionsString(optionsString);
  }, [title]);

  React.useEffect(() => {
    setDataString(JSON.stringify(data));
  }, []);

  return (
    <div
      style={{
        flex: '1 0 0',
        maxHeight: 'calc(100% - 38px)',
        maxWidth: '100%',
      }}
    >
      {/* This canvas is turned into a Chart.js plot via code in plotWindowPortal.component.tsx */}
      <canvas
        id="my-chart"
        ref={canvasRef}
        width="400"
        height="400"
        data-options={optionsString}
        data-data={dataString}
      ></canvas>
    </div>
  );
};

export default Plot;
