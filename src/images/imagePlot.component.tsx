import React from 'react';
// only import types as we don't actually run any chart.js code in React
import type { ChartData, ChartOptions } from 'chart.js';
import { CrosshairDimensionType } from '../api/images';

export interface ImagePlotProps {
  data: CrosshairDimensionType['intensity'];
  crosshairPosition: number;
  image?: string;
}

const commonChartOptions: ChartOptions<'line'> = {
  responsive: false,
  maintainAspectRatio: false,
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
};

const YChartOptions: ChartOptions<'line'> = {
  ...commonChartOptions,
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
};

const XChartOptions: ChartOptions<'line'> = {
  ...commonChartOptions,
  scales: {
    y: {
      type: 'linear',
      ticks: { padding: 0 },
      min: 0,
      max: 255,
    },
    x: {
      type: 'linear',
      // min max get set based on image size in useEffect
      ticks: { padding: 0, align: 'end' },
    },
  },
};

export const XImagePlot = (props: ImagePlotProps) => {
  const { data, image, crosshairPosition } = props;
  return (
    <ImagePlot
      data={data}
      image={image}
      crosshairPosition={crosshairPosition}
      type="x"
      chartOptions={XChartOptions}
    />
  );
};

export const YImagePlot = (props: ImagePlotProps) => {
  const { data, image, crosshairPosition } = props;
  return (
    <ImagePlot
      data={data}
      image={image}
      crosshairPosition={crosshairPosition}
      type="y"
      chartOptions={YChartOptions}
    />
  );
};

const ImagePlot = (
  props: ImagePlotProps & {
    type: 'x' | 'y';
    chartOptions: ChartOptions<'line'>;
  }
) => {
  const { data, crosshairPosition, image, type, chartOptions } = props;

  const [imageElement, setImageElement] = React.useState<HTMLImageElement>();

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
          borderColor: 'red', // same colour as crosshairPosition
          borderWidth: 1,
          pointRadius: 0,
          pointHitRadius: 2,
        },
      ],
    } satisfies ChartData<'line'>)
  );

  const [resizeString, setResizeString] = React.useState(
    JSON.stringify(
      type === 'x'
        ? {
            width: imageElement?.naturalWidth
              ? imageElement.naturalWidth + 29
              : 200,
            height: 200,
          }
        : {
            width: 200,
            height: imageElement?.naturalHeight
              ? imageElement.naturalHeight + 22
              : 200,
          }
    )
  );

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        labels: data.x,
        datasets: [
          {
            data: data.y,
            borderColor: 'red', // same colour as crosshairPosition
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
          ...(type === 'x'
            ? { xMin: crosshairPosition, xMax: crosshairPosition }
            : {
                yMin: crosshairPosition,
                yMax: crosshairPosition,
              }),
          borderColor: 'red',
          borderWidth: 1,
        },
      };

    if (image) {
      const img = new Image();
      img.src = image;
      setImageElement(img);

      if (img.naturalWidth && img.naturalHeight)
        setResizeString(
          JSON.stringify(
            type === 'x'
              ? {
                  width: img.naturalWidth + 29,
                  height: 200,
                }
              : { width: 200, height: img.naturalHeight + 22 }
          )
        );

      const limit = {
        min: 0,
        max: (type === 'x' ? img.naturalWidth : img.naturalHeight) - 1,
      };
      if (chartOptions.scales?.[type])
        // use Object.assign here as otherwise typescript gets unhappy about chartOptions.scales?.[type] potentially being undefined
        // so can't use a normal chartOptions.scales.[type] = command as it won't allow potential undefined on the LHS
        Object.assign(chartOptions.scales?.[type], {
          ...chartOptions.scales?.[type],
          ...limit,
        });
    }
    setOptionsString(JSON.stringify(chartOptions));
  }, [chartOptions, crosshairPosition, data, image, type]);

  /* This canvas is turned into a Chart.js plot via code in windowPortal.component.tsx */
  return (
    <canvas
      className="chartjs-chart"
      width={JSON.parse(resizeString).width}
      height={JSON.parse(resizeString).height}
      data-options={optionsString}
      data-data={dataString}
      data-type={'line'}
      data-resize={resizeString}
    />
  );
};
