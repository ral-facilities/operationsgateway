import React from 'react';
// only import types as we don't actually run any chart.js code in React
import { Chart, type ChartData, type ChartOptions } from 'chart.js';
import { CrosshairDimensionType } from '../api/images';

// In order for the plot area to match pixel to pixel to the image
// we need to offset/adjust for the width/height of the axis ticks.
// These were determined by trial and error aka how small can they be
// before the axis tick labels start to get cut off
/**
 * The width offset for XImagePlot
 */
export let XIMAGEPLOT_OFFSET = 0;
/**
 * The height offset for YImagePlot
 */
export let YIMAGEPLOT_OFFSET = 0;

export interface ImagePlotProps {
  data: CrosshairDimensionType['intensity'];
  crosshairPosition?: number;
  imageDims: { width: number; height: number };
}

const commonChartOptions: ChartOptions<'line'> = {
  responsive: true, // we don't actually care about resizing - this is just here to help when switching between retina & non-retina displays
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
  const { data, imageDims, crosshairPosition } = props;
  return (
    <ImagePlot
      data={data}
      imageDims={imageDims}
      crosshairPosition={crosshairPosition}
      type="x"
      chartOptions={XChartOptions}
    />
  );
};

export const YImagePlot = (props: ImagePlotProps) => {
  const { data, imageDims, crosshairPosition } = props;
  return (
    <ImagePlot
      data={data}
      imageDims={imageDims}
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
  const { data, crosshairPosition, imageDims, type, chartOptions } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // work out X and Y image offsets based on axis label text rendering
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d')!;
      context.font = `${Chart.defaults.font.weight ?? ''} ${Chart.defaults.font.size}px ${Chart.defaults.font.family}`;
      const metrics = context.measureText('255');
      XIMAGEPLOT_OFFSET =
        metrics.width + (Chart.defaults.scale.grid.tickLength ?? 0);
      YIMAGEPLOT_OFFSET =
        metrics.fontBoundingBoxAscent +
        metrics.fontBoundingBoxDescent +
        (Chart.defaults.scale.grid.tickLength ?? 0);
    }
  }, []);

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
  }, [data]);

  React.useEffect(() => {
    // need to create a deep clone so that any common options between x and y charts
    // can be updated without a race condition (e.g. annotations)
    const newChartOptions = JSON.parse(JSON.stringify(chartOptions));

    if (newChartOptions.plugins?.annotation && crosshairPosition)
      newChartOptions.plugins.annotation.annotations = {
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

    if (imageDims.width && imageDims.height) {
      const limit = {
        min: 0,
        max: (type === 'x' ? imageDims.width : imageDims.height) - 1,
      };
      if (newChartOptions.scales?.[type])
        // use Object.assign here as otherwise typescript gets unhappy about chartOptions.scales?.[type] potentially being undefined
        // so can't use a normal chartOptions.scales.[type] = command as it won't allow potential undefined on the LHS
        Object.assign(newChartOptions.scales?.[type], {
          ...newChartOptions.scales?.[type],
          ...limit,
        });
    }
    setOptionsString(JSON.stringify(newChartOptions));
  }, [chartOptions, crosshairPosition, imageDims, type]);

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
        ref={canvasRef}
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
