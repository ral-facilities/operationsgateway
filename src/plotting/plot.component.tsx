import React from 'react';
import {
  XAxisScale,
  PlotDataset,
  PlotType,
  YAxisScale,
  SelectedPlotChannel,
} from '../app.types';
// only import types as we don't actually run any chart.js code in React
import type { ChartOptions, ChartDataset } from 'chart.js';
// we import this even though we don't use it so we can get typescript info added to ChartOptions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type Zoom from 'chartjs-plugin-zoom';

export interface PlotProps {
  datasets: PlotDataset[];
  selectedPlotChannels: SelectedPlotChannel[];
  title: string;
  type: PlotType;
  XAxisScale: XAxisScale;
  leftYAxisScale: YAxisScale;
  rightYAxisScale: YAxisScale;
  XAxis?: string;
  XAxisDisplayName?: string;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  gridVisible: boolean;
  axesLabelsVisible: boolean;
  xMinimum?: number;
  xMaximum?: number;
  leftYAxisMinimum?: number;
  leftYAxisMaximum?: number;
  rightYAxisMinimum?: number;
  rightYAxisMaximum?: number;
  viewReset: boolean;
}

const Plot = (props: PlotProps) => {
  const {
    datasets,
    selectedPlotChannels,
    title,
    type,
    XAxisScale,
    leftYAxisScale,
    rightYAxisScale,
    XAxis,
    XAxisDisplayName,
    canvasRef,
    gridVisible,
    axesLabelsVisible,
    xMinimum,
    xMaximum,
    leftYAxisMinimum,
    leftYAxisMaximum,
    rightYAxisMinimum,
    rightYAxisMaximum,
    viewReset,
  } = props;

  // set the initial options
  const [optionsString, setOptionsString] = React.useState(
    JSON.stringify({
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
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            drag: {
              enabled: true,
            },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            mode: 'xy',
            modifierKey: 'shift',
          },
          limits: {
            x: {
              min: xMinimum ?? 'original',
              max: xMaximum ?? 'original',
            },
            y: {
              min: leftYAxisMinimum ?? 'original',
              max: leftYAxisMaximum ?? 'original',
            },
            y2: {
              min: rightYAxisMinimum ?? 'original',
              max: rightYAxisMaximum ?? 'original',
            },
          },
        },
      },
      scales: {
        x: {
          type: XAxisScale,
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
            text: XAxisDisplayName ?? XAxis,
          },
          grid: {
            display: gridVisible,
          },
          min: xMinimum,
          max: xMaximum,
        },
        y: {
          type: leftYAxisScale,
          display: true,
          position: 'left',
          grid: {
            display: gridVisible,
          },
          min: leftYAxisMinimum,
          max: leftYAxisMaximum,
        },
        y2: {
          type: rightYAxisScale,
          display: selectedPlotChannels.some(
            (channel) => channel.options.yAxis === 'right'
          ),
          position: 'right',
          grid: {
            display: gridVisible,
          },
          min: rightYAxisMinimum,
          max: rightYAxisMaximum,
        },
      },
    } satisfies ChartOptions<PlotType>)
  );
  const [dataString, setDataString] = React.useState(JSON.stringify(datasets));

  React.useEffect(() => {
    setOptionsString((oldOptionsString) => {
      const options: ChartOptions<PlotType> = JSON.parse(oldOptionsString);
      // change any options here to preserve any options chart.js adds
      options?.plugins?.title && (options.plugins.title.text = title);
      options?.scales?.x && (options.scales.x.min = xMinimum);
      options?.scales?.x && (options.scales.x.max = xMaximum);
      options?.plugins?.zoom?.limits?.x &&
        (options.plugins.zoom.limits.x = {
          min: xMinimum ?? 'original',
          max: xMaximum ?? 'original',
        });
      options?.scales?.x && (options.scales.x.type = XAxisScale);
      options?.scales?.x?.grid && (options.scales.x.grid.display = gridVisible);
      options?.scales?.x?.title &&
        (options.scales.x.title.display = axesLabelsVisible);
      options?.scales?.x?.title &&
        (options.scales.x.title.text = XAxisDisplayName ?? XAxis);
      options?.scales?.y && (options.scales.y.min = leftYAxisMinimum);
      options?.scales?.y && (options.scales.y.max = leftYAxisMaximum);
      options?.plugins?.zoom?.limits?.y &&
        (options.plugins.zoom.limits.y = {
          min: leftYAxisMinimum ?? 'original',
          max: leftYAxisMaximum ?? 'original',
        });
      options?.scales?.y && (options.scales.y.type = leftYAxisScale);
      options?.scales?.y?.grid && (options.scales.y.grid.display = gridVisible);
      options?.scales?.y &&
        (options.scales.y.display = selectedPlotChannels.some(
          (channel) =>
            channel.options.yAxis === 'left' && channel.options.visible
        ));
      options?.scales?.y2 && (options.scales.y2.min = rightYAxisMinimum);
      options?.scales?.y2 && (options.scales.y2.max = rightYAxisMaximum);
      options?.plugins?.zoom?.limits?.y2 &&
        (options.plugins.zoom.limits.y2 = {
          min: rightYAxisMinimum ?? 'original',
          max: rightYAxisMaximum ?? 'original',
        });
      options?.scales?.y2 && (options.scales.y2.type = rightYAxisScale);
      options?.scales?.y2 &&
        (options.scales.y2.display = selectedPlotChannels.some(
          (channel) =>
            channel.options.yAxis === 'right' && channel.options.visible
        ));
      options?.scales?.y2?.grid &&
        (options.scales.y2.grid.display = gridVisible);
      return JSON.stringify(options);
    });
  }, [
    XAxis,
    XAxisScale,
    leftYAxisScale,
    rightYAxisScale,
    axesLabelsVisible,
    gridVisible,
    title,
    xMaximum,
    xMinimum,
    leftYAxisMaximum,
    leftYAxisMinimum,
    rightYAxisMinimum,
    rightYAxisMaximum,
    selectedPlotChannels,
    XAxisDisplayName,
  ]);

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        datasets: datasets.map((dataset) => {
          const { options: channelConfig, displayName } =
            selectedPlotChannels.find(
              (channel) => channel.name === dataset.name
            ) ?? {};
          const lineStyle = channelConfig?.lineStyle ?? 'solid';

          return {
            label: displayName ?? dataset.name,
            data: dataset.data,
            parsing: {
              yAxisKey: dataset.name,
              xAxisKey: XAxis,
            },
            yAxisID:
              channelConfig && channelConfig.yAxis === 'right' ? 'y2' : 'y',
            borderColor:
              channelConfig && !channelConfig.visible
                ? 'rgba(0,0,0,0)'
                : channelConfig?.colour,
            backgroundColor:
              channelConfig && !channelConfig.visible
                ? 'rgba(0,0,0,0)'
                : channelConfig?.colour,
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
  }, [datasets, XAxis, selectedPlotChannels]);

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
        data-view={viewReset}
      ></canvas>
    </div>
  );
};

export default Plot;
