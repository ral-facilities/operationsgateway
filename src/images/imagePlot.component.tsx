import React from 'react';
// only import types as we don't actually run any plotly.js code in React
import { Box, useTheme } from '@mui/material';
import type {
  Config as PlotlyConfig,
  Layout as PlotlyLayout,
  PlotData as PlotlyPlotData,
} from 'plotly.js';
import { CrosshairDimensionType } from '../api/images';
import {
  calculateImageDimensionsToFitWindow,
  getScrollBarWidth,
} from './imageView.component';

// In order for the plot area to match pixel to pixel to the image
// we need to offset/adjust for the width/height of the axis ticks.
// These were determined by trial and error aka how small can they be
// before the axis tick labels start to get cut off
/**
 * The width offset for XImagePlot
 */
export const XIMAGEPLOT_OFFSET = 44; // 44 needed for 12/16-bit images (can have 5 digits on the intensity axis)
/**
 * The height offset for YImagePlot
 */
export const YIMAGEPLOT_OFFSET = 14;

export interface ImagePlotProps {
  data: CrosshairDimensionType['intensity'];
  crosshairPosition?: number;
  imageDims: { width: number; height: number };
  plotContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const plotlyConfig: Partial<PlotlyConfig> = {
  displaylogo: false,
  displayModeBar: false,
  showTips: false,
};

export const imagePlotInitWidthAndHeight = 300 + getScrollBarWidth();

const commonChartOptions: Partial<PlotlyLayout> = {
  showlegend: false,
  autosize: false,
  width: 300, // width to be adjusted later for x plot
  height: 300, // height to be adjusted later for y plot
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
    pad: 0,
  },
  paper_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
  plot_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
};

const YChartOptions: Partial<PlotlyLayout> = {
  ...commonChartOptions,
  xaxis: {
    type: 'linear',
    fixedrange: true,
    rangemode: 'tozero',
    showticklabels: false,
    showline: false,
    showgrid: true,
  },
  yaxis: {
    type: 'linear',
    fixedrange: true,
    autorange: false,
    zeroline: false,
    ticklen: 4,
    ticklabelposition: 'outside bottom',
    ticklabeloverflow: 'allow',
    // @ts-expect-error for some reason it's not accepting left as a value, when it's valid
    automargin: 'left', // auto-margin can be used for this axis as it does not affect image pixel alignment as long as we use "left"
    exponentformat: 'none',
    tickformat: 'd',
  },
};

const YChartAxis: Partial<PlotlyLayout> = {
  ...commonChartOptions,
  height: YIMAGEPLOT_OFFSET,
  margin: {
    ...commonChartOptions.margin,
    l: Object.hasOwn(window, 'chrome') ? 34 : 35,
    b: YIMAGEPLOT_OFFSET - 1,
    t: 1,
  },
  xaxis: {
    fixedrange: true,
    type: 'linear',
    rangemode: 'tozero',
    ticklen: 4,
    exponentformat: 'none',
    tickformat: 'd',
    ticklabeloverflow: 'allow',
    side: 'top',
    ticks: 'inside',
    ticklabelposition: 'inside',
    zeroline: false,
  },
  yaxis: {
    visible: false,
    fixedrange: true,
  },
};

const XChartOptions: Partial<PlotlyLayout> = {
  ...commonChartOptions,
  xaxis: {
    type: 'linear',
    fixedrange: true,
    autorange: false,
    zeroline: false,
    ticklabelposition: 'outside right',
    ticklabeloverflow: 'allow',
    ticklen: 4,
    // @ts-expect-error for some reason it's not accepting bottom as a value, when it's valid
    automargin: 'bottom', // auto-margin can be used for this axis as it does not affect image pixel alignment as long as we use "bottom"
    exponentformat: 'none',
    tickformat: 'd',
  },
  yaxis: {
    showticklabels: false,
    showline: false,
    showgrid: true,
    type: 'linear',
    fixedrange: true,
    rangemode: 'tozero',
  },
};

const XChartAxis: Partial<PlotlyLayout> = {
  ...commonChartOptions,
  width: XIMAGEPLOT_OFFSET,
  margin: {
    ...commonChartOptions.margin,
    r: XIMAGEPLOT_OFFSET - 1,
    l: 1,
    b: Object.hasOwn(window, 'chrome') ? 17 : 18,
  },
  xaxis: {
    visible: false,
    fixedrange: true,
  },
  yaxis: {
    type: 'linear',
    fixedrange: true,
    rangemode: 'tozero',
    zeroline: false,
    ticklen: 4,
    exponentformat: 'none',
    tickformat: 'd',
    ticklabeloverflow: 'allow',
    side: 'left',
    ticks: 'inside',
    ticklabelposition: 'inside',
  },
};

export const XImagePlot = (props: ImagePlotProps) => {
  const { data, imageDims, crosshairPosition, plotContainerRef } = props;
  return (
    <ImagePlot
      data={data}
      imageDims={imageDims}
      crosshairPosition={crosshairPosition}
      type="x"
      chartOptions={XChartOptions}
      plotContainerRef={plotContainerRef}
    />
  );
};

export const YImagePlot = (props: ImagePlotProps) => {
  const { data, imageDims, crosshairPosition, plotContainerRef } = props;
  return (
    <ImagePlot
      data={data}
      imageDims={imageDims}
      crosshairPosition={crosshairPosition}
      type="y"
      chartOptions={YChartOptions}
      plotContainerRef={plotContainerRef}
    />
  );
};

const ImagePlot = (
  props: ImagePlotProps & {
    type: 'x' | 'y';
    chartOptions: Partial<PlotlyLayout>;
  }
) => {
  const {
    data,
    crosshairPosition,
    imageDims,
    type,
    chartOptions,
    plotContainerRef,
  } = props;

  const {
    palette: {
      mode: themeMode,
      background: { default: themeBGColor },
    },
  } = useTheme();

  const [layoutString, setLayoutString] = React.useState(
    JSON.stringify({} satisfies Partial<PlotlyLayout>)
  );
  const [axisLayoutString, setAxisLayoutString] = React.useState(
    JSON.stringify({} satisfies Partial<PlotlyLayout>)
  );

  const [dataString, setDataString] = React.useState(JSON.stringify([]));

  React.useEffect(() => {
    setDataString(
      JSON.stringify([
        {
          x: data[type === 'x' ? 'x' : 'y'],
          y: data[type === 'x' ? 'y' : 'x'],
          line: {
            color: 'red',
            width: 1,
          },
          mode: 'lines',
          ...(type === 'y'
            ? { hovertemplate: '(%{y}, %{x})<extra></extra>' }
            : {}), // need to reverse the hover tooltip as on y plot x & y axis are "reversed"
        } satisfies Partial<PlotlyPlotData>,
      ])
    );
  }, [data, type]);

  React.useEffect(() => {
    const fontColour = themeMode === 'dark' ? '#ADBABD' : '#444';
    const newAxisChartOptions: Partial<PlotlyLayout> = JSON.parse(
      JSON.stringify(type === 'x' ? XChartAxis : YChartAxis)
    );
    newAxisChartOptions[`${type === 'x' ? 'y' : 'x'}axis`] = {
      ...newAxisChartOptions[`${type === 'x' ? 'y' : 'x'}axis`],
      range: [0, Math.max(...data['y'])],
    };
    newAxisChartOptions.paper_bgcolor =
      themeMode === 'light' ? '#fff' : themeBGColor;
    if (newAxisChartOptions.xaxis) {
      newAxisChartOptions.xaxis.tickcolor = fontColour;
      newAxisChartOptions.xaxis.linecolor = fontColour;
    }
    if (newAxisChartOptions.yaxis) {
      newAxisChartOptions.yaxis.tickcolor = fontColour;
      newAxisChartOptions.yaxis.linecolor = fontColour;
    }
    setAxisLayoutString(JSON.stringify(newAxisChartOptions));
  }, [data, themeBGColor, themeMode, type]);

  React.useEffect(() => {
    const fontColour = themeMode === 'dark' ? '#ADBABD' : '#444';
    const lineColour =
      themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee';

    // need to create a deep clone so that any common options between x and y charts
    // can be updated without a race condition (e.g. annotations)
    const newChartOptions: Partial<PlotlyLayout> = JSON.parse(
      JSON.stringify(chartOptions)
    );

    newChartOptions.font = { color: fontColour };
    if (newChartOptions.xaxis) {
      newChartOptions.xaxis.gridcolor = lineColour;
      newChartOptions.xaxis.tickcolor = fontColour;
      newChartOptions.xaxis.linecolor = fontColour;
    }
    if (newChartOptions.yaxis) {
      newChartOptions.yaxis.gridcolor = lineColour;
      newChartOptions.yaxis.tickcolor = fontColour;
      newChartOptions.yaxis.linecolor = fontColour;
    }

    if (typeof crosshairPosition !== 'undefined')
      newChartOptions.shapes = [
        {
          type: 'line',
          ...(type === 'x'
            ? {
                x0: crosshairPosition,
                x1: crosshairPosition,
                yref: 'paper',
                y0: 0,
                y1: 1,
              }
            : {
                y0: crosshairPosition,
                y1: crosshairPosition,
                xref: 'paper',
                x0: 0,
                x1: 1,
              }),
          line: {
            color: 'red',
            width: 1,
          },
        },
      ];

    if (imageDims.width && imageDims.height) {
      const rangeMax = (type === 'x' ? imageDims.width : imageDims.height) - 1;
      // need to reverse the range when it's a y plot
      const range = type === 'x' ? [0, rangeMax] : [rangeMax, 0];
      newChartOptions[`${type}axis`] = {
        ...newChartOptions[`${type}axis`],
        range,
      };

      if (type === 'x') newChartOptions.width = imageDims.width;
      if (type === 'y') newChartOptions.height = imageDims.height;
    }
    setLayoutString(JSON.stringify(newChartOptions));
  }, [
    chartOptions,
    crosshairPosition,
    imageDims,
    themeMode,
    themeBGColor,
    type,
  ]);

  /* This canvas is turned into a Plotly.js plot via code in windowPortal.component.tsx */
  return (
    <Box
      sx={
        type === 'x'
          ? {
              width: `calc(${calculateImageDimensionsToFitWindow(
                'width',
                imageDims,
                true
              )} + ${XIMAGEPLOT_OFFSET}px)`,
              height: imagePlotInitWidthAndHeight,
              display: 'flex',
              flexDirection: 'row',
            }
          : {
              width: imagePlotInitWidthAndHeight,
              height: `calc(${calculateImageDimensionsToFitWindow(
                'height',
                imageDims,
                true
              )} + ${YIMAGEPLOT_OFFSET}px)`,
              display: 'flex',
              flexDirection: 'column',
            }
      }
    >
      <Box
        className="plotly-chart"
        data-config={JSON.stringify(plotlyConfig)}
        data-layout={layoutString}
        data-data={dataString}
        sx={{
          '& .shape-group path': {
            shapeRendering: 'crispEdges',
          },
          overflow: 'auto',
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin',
          flex: 1,
        }}
        ref={plotContainerRef}
      ></Box>
      <Box
        className="plotly-chart"
        data-config={JSON.stringify(plotlyConfig)}
        data-layout={axisLayoutString}
        data-data={'[]'}
      ></Box>
    </Box>
  );
};
