import React from 'react';
import {
  PlotDataset,
  PlotType,
  SelectedPlotChannel,
  XAxisScale,
  YAxisScale,
} from '../app.types';
// only import types as we don't actually run any chart.js code in React
import type { ChartDataset, ChartOptions } from 'chart.js';

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
  leftYAxisLabel?: string;
  rightYAxisLabel?: string;
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
    leftYAxisLabel,
    rightYAxisLabel,
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
              threshold: 15,
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
          title: {
            display: Boolean(leftYAxisLabel),
            text: leftYAxisLabel,
          },
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
          title: {
            display: Boolean(rightYAxisLabel),
            text: rightYAxisLabel,
          },
        },
      },
      transitions: {
        zoom: {
          animation: {
            duration: 250,
          },
        },
      },
    } satisfies ChartOptions<PlotType>)
  );
  const [dataString, setDataString] = React.useState(JSON.stringify(datasets));

  React.useEffect(() => {
    setOptionsString((oldOptionsString) => {
      const options: ChartOptions<PlotType> = JSON.parse(oldOptionsString);
      // change any options here to preserve any options chart.js adds
      if (options?.plugins?.title) options.plugins.title.text = title;
      if (options?.scales?.x) options.scales.x.min = xMinimum;
      if (options?.scales?.x) options.scales.x.max = xMaximum;
      if (options?.plugins?.zoom?.limits?.x)
        options.plugins.zoom.limits.x = {
          min: xMinimum ?? 'original',
          max: xMaximum ?? 'original',
        };
      if (options?.scales?.x) options.scales.x.type = XAxisScale;
      if (options?.scales?.x?.grid) options.scales.x.grid.display = gridVisible;
      if (options?.scales?.x?.title)
        options.scales.x.title.display = axesLabelsVisible;
      if (options?.scales?.x?.title)
        options.scales.x.title.text = XAxisDisplayName ?? XAxis;
      if (options?.scales?.y) options.scales.y.min = leftYAxisMinimum;
      if (options?.scales?.y) options.scales.y.max = leftYAxisMaximum;
      if (options?.plugins?.zoom?.limits?.y)
        options.plugins.zoom.limits.y = {
          min: leftYAxisMinimum ?? 'original',
          max: leftYAxisMaximum ?? 'original',
        };
      if (options?.scales?.y) options.scales.y.type = leftYAxisScale;
      if (options?.scales?.y?.grid) options.scales.y.grid.display = gridVisible;
      if (options?.scales?.y)
        options.scales.y.display = selectedPlotChannels.some(
          (channel) =>
            channel.options.yAxis === 'left' && channel.options.visible
        );
      if (options?.scales?.y)
        options.scales.y.title = {
          display: Boolean(leftYAxisLabel),
          text: leftYAxisLabel,
        };
      if (options?.scales?.y2) options.scales.y2.min = rightYAxisMinimum;
      if (options?.scales?.y2) options.scales.y2.max = rightYAxisMaximum;
      if (options?.plugins?.zoom?.limits?.y2)
        options.plugins.zoom.limits.y2 = {
          min: rightYAxisMinimum ?? 'original',
          max: rightYAxisMaximum ?? 'original',
        };
      if (options?.scales?.y2) options.scales.y2.type = rightYAxisScale;
      if (options?.scales?.y2)
        options.scales.y2.display = selectedPlotChannels.some(
          (channel) =>
            channel.options.yAxis === 'right' && channel.options.visible
        );
      if (options?.scales?.y2?.grid)
        options.scales.y2.grid.display = gridVisible;
      if (options?.scales?.y2)
        options.scales.y2.title = {
          display: Boolean(rightYAxisLabel),
          text: rightYAxisLabel,
        };
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
    leftYAxisLabel,
    rightYAxisLabel,
  ]);

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        datasets: datasets.map((dataset) => {
          const {
            options: channelConfig,
            displayName,
            units,
          } = selectedPlotChannels.find(
            (channel) => channel.name === dataset.name
          ) ?? {};
          const lineStyle = channelConfig?.lineStyle ?? 'solid';
          const lineWidth = channelConfig?.lineWidth ?? 3;
          const markerStyle = channelConfig?.markerStyle ?? 'circle';
          const markerSize = channelConfig?.markerSize ?? 3;
          const markerColour = channelConfig?.markerColour;
          const displayNameWithUnits = units
            ? `${displayName} (${units})`
            : `${displayName}`;

          return {
            label: displayNameWithUnits ?? dataset.name,
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
                ? [5 + (lineWidth - 3), 5 + (lineWidth - 3)]
                : lineStyle === 'dotted'
                  ? [0, 5 + (lineWidth - 3)]
                  : undefined,
            borderCapStyle: lineStyle === 'dotted' ? 'round' : undefined,
            borderWidth: lineWidth,
            pointBorderWidth: 1 + Math.max(0, (markerSize - 3) / 2),
            pointStyle: markerStyle,
            pointRadius: markerSize,
            pointHoverRadius: markerSize + 1,
            pointBackgroundColor: markerColour,
            pointBorderColor: markerColour,
          } satisfies ChartDataset<PlotType, PlotDataset['data']>;
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
      {/* This canvas is turned into a Chart.js plot via code in windowPortal.component.tsx */}
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
