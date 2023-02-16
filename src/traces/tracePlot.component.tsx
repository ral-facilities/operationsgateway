import React from 'react';
import { Waveform } from '../app.types';
// only import types as we don't actually run any chart.js code in React
import type { ChartOptions, ChartData } from 'chart.js';
// we import this even though we don't use it so we can get typescript info added to ChartOptions
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export interface TracePlotProps {
  trace: Waveform;
  title: string;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  viewReset: boolean;
  pointsVisible: boolean;
}

const TracePlot = (props: TracePlotProps) => {
  const { trace, title, canvasRef, viewReset, pointsVisible } = props;

  const chartOptions: ChartOptions<'line'> = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'point',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: title,
        },
        zoom: {
          zoom: {
            drag: {
              enabled: true,
            },
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            mode: 'xy',
            modifierKey: 'shift',
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          type: 'linear',
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
        },
      },
    }),
    [title]
  );

  // set the initial options
  const [optionsString, setOptionsString] = React.useState(
    JSON.stringify(chartOptions)
  );
  const [dataString, setDataString] = React.useState('');

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        labels: trace.x,
        datasets: [
          {
            data: trace.y,
            borderColor: '#1F77B4', // same colour as trace thumbnails from the backend
            borderWidth: 1.5,
            pointRadius: pointsVisible ? 3 : 0,
            pointHitRadius: 4, // ...but allow tooltips to act as if the points are there
          },
        ],
      } satisfies ChartData<'line'>)
    );
    const xLimits = { min: Math.min(...trace.x), max: Math.max(...trace.x) };
    const yLimits = { min: Math.min(...trace.y), max: Math.max(...trace.y) };
    if (chartOptions.plugins?.zoom)
      chartOptions.plugins.zoom.limits = {
        x: xLimits,
        y: yLimits,
      };
    if (chartOptions.scales?.['x'])
      chartOptions.scales.x = {
        ...chartOptions.scales.x,
        ...xLimits,
      };
    if (chartOptions.scales?.['y'])
      chartOptions.scales.y = {
        ...chartOptions.scales.y,
        ...yLimits,
      };
    setOptionsString(JSON.stringify(chartOptions));
  }, [chartOptions, trace, pointsVisible]);

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
        data-type={'line'}
        data-view={viewReset}
      ></canvas>
    </div>
  );
};

export default TracePlot;
