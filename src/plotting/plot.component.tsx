import React from 'react';
import {
  XAxisSettings,
  PlotDataset,
  PlotType,
  YAxisSettings,
  SelectedPlotChannel,
} from '../app.types';
// only import types as we don't actually run any chart.js code in React
import type { ChartOptions, ChartDataset } from 'chart.js';
// we import this even though we don't use it so we can get typescript info added to ChartOptions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type Zoom from 'chartjs-plugin-zoom';

export interface PlotProps {
  datasets: PlotDataset[];
  selectedChannels: SelectedPlotChannel[];
  title: string;
  type: PlotType;
  XAxisSettings: XAxisSettings;
  YAxesSettings: YAxisSettings;
  XAxis: string;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  gridVisible: boolean;
  axesLabelsVisible: boolean;
  xMinimum?: number;
  xMaximum?: number;
  yMinimum?: number;
  yMaximum?: number;
}

const Plot = (props: PlotProps) => {
  const {
    datasets,
    selectedChannels,
    title,
    type,
    XAxisSettings,
    YAxesSettings,
    XAxis,
    canvasRef,
    gridVisible,
    axesLabelsVisible,
    xMinimum,
    xMaximum,
    yMinimum,
    yMaximum,
  } = props;

  // set the initial options
  const [optionsString, setOptionsString] = React.useState(
    JSON.stringify({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
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
          type: XAxisSettings.scale,
          time: {
            displayFormats: {
              millisecond: 'HH:mm:ss:SSS',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              hour: 'd MMM ha',
              day: 'd MMM',
              week: 'd MMM',
              month: 'MMM yyyy',
              quarter: 'MMM yyyy',
              year: 'yyyy',
            },
            tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
          },
          title: {
            display: axesLabelsVisible,
            text: XAxis,
          },
          grid: {
            display: gridVisible,
          },
          min: xMinimum,
          max: xMaximum,
        },
        y: {
          type: YAxesSettings.scale,
          display: true,
          position: 'left',
          grid: {
            display: gridVisible,
          },
          min: yMinimum,
          max: yMaximum,
        },
        y2: {
          type: YAxesSettings.scale,
          display: false,
          position: 'right',
          grid: {
            display: gridVisible,
          },
        },
      },
    } as ChartOptions<PlotType>)
  );
  const [dataString, setDataString] = React.useState(JSON.stringify(datasets));

  React.useEffect(() => {
    setOptionsString((oldOptionsString) => {
      const options: ChartOptions<PlotType> = JSON.parse(oldOptionsString);
      // change any options here to preserve any options chart.js adds
      options?.plugins?.title && (options.plugins.title.text = title);

      if (options?.scales?.x) {
        options.scales.x.type = XAxisSettings.scale;
        options.scales.x.min = xMinimum;
        options.scales.x.max = xMaximum;

        options.scales.x.grid && (options.scales.x.grid.display = gridVisible);

        if (options.scales.x.title) {
          options.scales.x.title.display = axesLabelsVisible;
          options.scales.x.title.text = XAxis;
        }
      }
      if (options?.scales?.y) {
        options.scales.y.type = YAxesSettings.scale;
        options.scales.y.min = yMinimum;
        options.scales.y.max = yMaximum;

        options.scales.y.grid && (options.scales.y.grid.display = gridVisible);
      }

      return JSON.stringify(options);
    });
  }, [
    title,
    XAxisSettings,
    YAxesSettings,
    selectedChannels,
    gridVisible,
    axesLabelsVisible,
    XAxis,
    xMinimum,
    xMaximum,
    yMinimum,
    yMaximum,
  ]);

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        datasets: datasets.map((dataset) => {
          const channelConfig = selectedChannels.find(
            (channel) => channel.name === dataset.name
          )?.options;
          const lineStyle = channelConfig?.lineStyle ?? 'solid';

          return {
            label: dataset.name,
            data: dataset.data,
            parsing: {
              yAxisKey: dataset.name,
              xAxisKey: XAxis,
            },
            borderColor:
              channelConfig && !channelConfig.visible
                ? 'rgba(0,0,0,0)'
                : '#e31a1c',
            backgroundColor:
              channelConfig && !channelConfig.visible
                ? 'rgba(0,0,0,0)'
                : '#e31a1c',
            borderDash:
              lineStyle === 'dashed'
                ? [5, 5]
                : lineStyle === 'dotted'
                ? [0, 5]
                : undefined,
            pointRadius: lineStyle === 'dotted' ? 3 : undefined,
            borderCapStyle: lineStyle === 'dotted' ? 'round' : undefined,
          } as ChartDataset<PlotType, PlotDataset['data']>;
        }),
      })
    );
  }, [datasets, XAxis, selectedChannels]);

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
