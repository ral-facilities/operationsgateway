import React from 'react';
// only import types as we don't actually run any plotly.js code in React
import type {
  Config as PlotlyConfig,
  Layout as PlotlyLayout,
  PlotData as PlotlyPlotData,
} from 'plotly.js';
import { CrosshairDimensionType } from '../api/images';
import { Box, useTheme } from '@mui/material';

// In order for the plot area to match pixel to pixel to the image
// we need to offset/adjust for the width/height of the axis ticks.
// These were determined by trial and error aka how small can they be
// before the axis tick labels start to get cut off
/**
 * The width offset for XImagePlot
 */
export const XIMAGEPLOT_OFFSET = 48; // 48 needed for 16-bit images (theoretically have 5 digits on the intensity axis)
/**
 * The height offset for YImagePlot
 */
export const YIMAGEPLOT_OFFSET = 20;

export interface ImagePlotProps {
  data: CrosshairDimensionType['intensity'];
  crosshairPosition?: number;
  imageDims: { width: number; height: number };
}

const plotlyConfig: Partial<PlotlyConfig> = {
  displaylogo: false,
  displayModeBar: false,
};

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
    zeroline: false,
    ticklen: 4,
    exponentformat: 'none',
    tickformat: 'd',
    ticklabeloverflow: 'allow',
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
  margin: {
    ...commonChartOptions.margin,
    b: YIMAGEPLOT_OFFSET,
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
    type: 'linear',
    fixedrange: true,
    side: 'right',
    rangemode: 'tozero',
    zeroline: false,
    ticklen: 4,
    exponentformat: 'none',
    tickformat: 'd',
    ticklabeloverflow: 'allow',
  },
  margin: {
    ...commonChartOptions.margin,
    r: XIMAGEPLOT_OFFSET,
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
    chartOptions: Partial<PlotlyLayout>;
  }
) => {
  const { data, crosshairPosition, imageDims, type, chartOptions } = props;

  const {
    palette: { mode: themeMode },
  } = useTheme();

  const [optionsString, setOptionsString] = React.useState(
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
      if (type === 'x')
        newChartOptions.width = imageDims.width + XIMAGEPLOT_OFFSET;
      if (type === 'y')
        newChartOptions.height = imageDims.height + YIMAGEPLOT_OFFSET;
    }
    setOptionsString(JSON.stringify(newChartOptions));
  }, [chartOptions, crosshairPosition, imageDims, themeMode, type]);

  /* This canvas is turned into a Plotly.js plot via code in windowPortal.component.tsx */
  return (
    <Box
      className="plotly-chart"
      data-config={JSON.stringify(plotlyConfig)}
      data-layout={optionsString}
      data-data={dataString}
      sx={{
        '& .shape-group path': {
          shapeRendering: 'crispEdges',
        },
      }}
    ></Box>
  );
};
