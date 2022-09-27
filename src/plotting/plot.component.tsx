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

export const data = {
  datasets: [
    {
      label: 'Dataset 1',
      data: [
        { x: 1, y: -655 },
        { x: 2, y: -752 },
        { x: 3, y: 696 },
        { x: 4, y: 222 },
        { x: 5, y: 789 },
        { x: 6, y: -251 },
        { x: 7, y: -643 },
      ],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      yAxisID: 'y',
    },
    {
      label: 'Dataset 2',
      data: [
        { x: 1, y: 5506056 },
        { x: 2, y: 6237210 },
        { x: 3, y: 5421636 },
        { x: 4, y: 7190345 },
        { x: 5, y: 9040798 },
        { x: 6, y: 5487210 },
        { x: 7, y: 9631115 },
      ],
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
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

const Plot = (props: PlotProps) => {
  const {
    // datasets,
    // selectedChannels,
    title,
    type,
    // XAxisSettings,
    // YAxesSettings,
    // XAxis,
    canvasRef,
  } = props;

  // set the initial options
  const [optionsString, setOptionsString] = React.useState(
    JSON.stringify({
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
      scales: {
        x: {
          type: 'linear' as const,
        },
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
    })
  );
  const [dataString, setDataString] = React.useState(JSON.stringify(data));

  React.useEffect(() => {
    setOptionsString((oldOptionsString) => {
      const options = JSON.parse(oldOptionsString);
      // change any options here to preserve any options chart.js adds
      options.plugins.title.text = title;
      return JSON.stringify(options);
    });
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
        data-type={type}
      ></canvas>
    </div>
  );
};

export default Plot;
