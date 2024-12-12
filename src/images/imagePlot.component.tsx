import React from 'react';
// only import types as we don't actually run any chart.js code in React
import type { ChartData, ChartOptions } from 'chart.js';
import { CrosshairDimensionType } from '../api/images';

// In order for the plot area to match pixel to pixel to the image
// we need to offset/adjust for the width/height of the axis ticks.
// These were determined by trial and error aka how small can they be
// before the axis tick labels start to get cut off
/**
 * The width offset for XImagePlot
 */
export const XIMAGEPLOT_OFFSET = 29;
/**
 * The height offset for YImagePlot
 */
export const YIMAGEPLOT_OFFSET = 22;

export interface ImagePlotProps {
  data: CrosshairDimensionType['intensity'];
  crosshairPosition: number;
  image?: string;
}

const commonChartOptions: ChartOptions<'line'> = {
  responsive: true, // we don't actually care about resizing - this is just here to help when switching between retina & non-retina displays
  resizeDelay: 1, // delay by 1ms to ensure that the initial centroid crosshair annotation gets drawn
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
      ticks: { padding: 0, align: 'start' },
      reverse: true,
    },
    x: {
      type: 'linear',
      min: 0,
      max: 255,
      ticks: { padding: 0, count: 5, precision: 0 },
    },
  },
};

const XChartOptions: ChartOptions<'line'> = {
  ...commonChartOptions,
  scales: {
    y: {
      type: 'linear',
      ticks: { padding: 0, count: 5, precision: 0 },
      min: 0,
      max: 255,
    },
    x: {
      type: 'linear',
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

  const [imageDims, setImageDims] = React.useState({ width: 200, height: 200 });

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

      if (img.naturalWidth && img.naturalHeight) {
        setImageDims({ width: img.naturalWidth, height: img.naturalHeight });

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
    }
    setOptionsString(JSON.stringify(chartOptions));
  }, [chartOptions, crosshairPosition, data, image, type]);

  /* This canvas is turned into a Chart.js plot via code in windowPortal.component.tsx */
  return (
    <div
      style={
        type === 'x'
          ? {
              width: imageDims.width + XIMAGEPLOT_OFFSET,
              height: 200,
            }
          : {
              width: 200,
              height: imageDims.height + YIMAGEPLOT_OFFSET,
            }
      }
    >
      <canvas
        className="chartjs-chart"
        width={200}
        height={200}
        data-options={optionsString}
        data-data={dataString}
        data-type={'line'}
      />
    </div>
  );
};
