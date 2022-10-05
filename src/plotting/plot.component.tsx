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
  selectedPlotChannels: SelectedPlotChannel[];
  title: string;
  type: PlotType;
  XAxisSettings: XAxisSettings;
  YAxesSettings: YAxisSettings;
  XAxis: string;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  viewReset: boolean;
}

const Plot = (props: PlotProps) => {
  const {
    datasets,
    selectedPlotChannels,
    title,
    type,
    XAxisSettings,
    YAxesSettings,
    XAxis,
    canvasRef,
    viewReset,
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
        },
        y: {
          type: YAxesSettings.scale,
          display: true,
          position: 'left',
        },
        y2: {
          type: YAxesSettings.scale,
          display: selectedPlotChannels.some(
            (channel) => channel.options.yAxis === 'right'
          ),
          position: 'right',
          grid: {
            drawOnChartArea: false,
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
      options?.scales?.x && (options.scales.x.type = XAxisSettings.scale);
      options?.scales?.y && (options.scales.y.type = YAxesSettings.scale);
      options?.scales?.y2 && (options.scales.y2.type = YAxesSettings.scale);
      options?.scales?.y2 &&
        (options.scales.y2.display = selectedPlotChannels.some(
          (channel) => channel.options.yAxis === 'right'
        ));
      return JSON.stringify(options);
    });
  }, [title, XAxisSettings, YAxesSettings, selectedPlotChannels]);

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        datasets: datasets.map((dataset) => {
          const channelConfig = selectedPlotChannels.find(
            (channel) => channel.name === dataset.name
          )?.options;
          return {
            label: dataset.name,
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
