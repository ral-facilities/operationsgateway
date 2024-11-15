import React from 'react';
// only import types as we don't actually run any chart.js code in React
import type { ChartData, ChartOptions } from 'chart.js';
import { CrosshairDimensionType } from '../api/images';

export interface ImagePlotProps {
  data: CrosshairDimensionType['intensity'];
  crosshair: { x: number; y: number };
  image?: string;
}

const ImagePlot = (props: ImagePlotProps) => {
  const { data, crosshair, image } = props;

  const [imageElement, setImageElement] = React.useState<HTMLImageElement>();

  const chartOptions: ChartOptions<'line'> = React.useMemo(
    () => ({
      responsive: false,
      interaction: {
        mode: 'index',
        intersect: true,
      },
      plugins: {
        legend: {
          display: false,
        },
        annotation: { annotations: {} },
      },
      indexAxis: 'y',
      scales: {
        y: {
          type: 'linear',
          // min max get set based on image size in useEffect
          ticks: { padding: 0, align: 'start' },
          reverse: true,
        },
        x: {
          type: 'linear',
          min: 0,
          max: 255,
          ticks: { padding: 0 },
        },
      },
    }),
    []
  );

  // set the initial options
  const [optionsString, setOptionsString] = React.useState(
    JSON.stringify(chartOptions)
  );

  const [dataString, setDataString] = React.useState(
    JSON.stringify({
      labels: data.x,
      datasets: [
        {
          data: data.y,
          borderColor: 'red', // same colour as crosshair
          borderWidth: 1,
          pointRadius: 0,
          pointHitRadius: 2,
        },
      ],
    } satisfies ChartData<'line'>)
  );

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        labels: data.x,
        datasets: [
          {
            data: data.y,
            borderColor: 'red', // same colour as crosshair
            borderWidth: 1,
            pointRadius: 0,
            pointHitRadius: 2,
          },
        ],
      } satisfies ChartData<'line'>)
    );

    if (chartOptions.plugins?.annotation)
      chartOptions.plugins.annotation.annotations = {
        line: {
          type: 'line',
          yMin: crosshair.y,
          yMax: crosshair.y,
          borderColor: 'red',
          borderWidth: 1,
        },
      };

    if (image) {
      const img = new Image();
      img.src = image;
      setImageElement(img);

      const yLimits = { min: 0, max: img.naturalHeight - 1 };
      if (chartOptions.scales?.['y'])
        chartOptions.scales.y = {
          ...chartOptions.scales.y,
          ...yLimits,
        };
    }
    setOptionsString(JSON.stringify(chartOptions));
  }, [chartOptions, crosshair.y, data, image]);

  /* This canvas is turned into a Chart.js plot via code in windowPortal.component.tsx */
  return (
    <canvas
      className="chartjs-chart"
      width={200}
      height={
        imageElement?.naturalHeight ? imageElement.naturalHeight + 22 : 200
      }
      data-options={optionsString}
      data-data={dataString}
      data-type={'line'}
    />
  );
};

export default ImagePlot;
