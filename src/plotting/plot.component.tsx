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
    datasets,
    selectedChannels,
    title,
    type,
    XAxisSettings,
    YAxesSettings,
    XAxis,
    canvasRef,
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
          display: false,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    })
  );
  const [dataString, setDataString] = React.useState(JSON.stringify(datasets));

  React.useEffect(() => {
    setOptionsString((oldOptionsString) => {
      const options = JSON.parse(oldOptionsString);
      // change any options here to preserve any options chart.js adds
      options.plugins.title.text = title;
      options.scales.x.type = XAxisSettings.scale;
      options.scales.y.type = YAxesSettings.scale;
      return JSON.stringify(options);
    });
  }, [title, XAxisSettings, YAxesSettings, selectedChannels]);

  React.useEffect(() => {
    setDataString(
      JSON.stringify({
        datasets: datasets.map((dataset) => {
          const channelConfig = selectedChannels.find(
            (channel) => channel.name === dataset.name
          )?.options;
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
          };
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
