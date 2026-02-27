import React from 'react';
import { Waveform } from '../app.types';
// only import types as we don't actually run any plotly.js code in React
import { useTheme } from '@mui/material';
import type {
  Config as PlotlyConfig,
  Layout as PlotlyLayout,
  PlotData as PlotlyPlotData,
} from 'plotly.js';

export interface TracePlotProps {
  trace: Waveform;
  title: string;
  chartRef: React.MutableRefObject<HTMLDivElement | null>;
  viewReset: boolean;
  pointsVisible: boolean;
  xUnits?: string;
  yUnits?: string;
  plotAxisSigFigs?: string;
}

const plotlyConfigString = JSON.stringify({
  scrollZoom: true,
  displaylogo: false,
  displayModeBar: false,
  responsive: true,
  showAxisDragHandles: false,
  showTips: false,
} satisfies Partial<PlotlyConfig>);

const TracePlot = (props: TracePlotProps) => {
  const {
    trace,
    title,
    chartRef: chartRef,
    viewReset,
    pointsVisible,
    xUnits,
    yUnits,
    plotAxisSigFigs,
  } = props;

  const {
    palette: { mode: themeMode },
  } = useTheme();
  const fontColour = themeMode === 'dark' ? '#ADBABD' : '#444';
  const chartOptions = React.useMemo(
    () =>
      ({
        paper_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
        plot_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
        title: {
          text: title,
          // @ts-expect-error this property does exist in plotly.js & in the docs, just types are wrong
          automargin: true,
          yref: 'paper',
        },
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0,
        },
        showlegend: false,
        xaxis: {
          type: 'linear',
          exponentformat: 'none',
          automargin: true,
          title: {
            text: xUnits ? `units: ${xUnits}` : undefined,
            font: { color: fontColour },
          },
          tickformat: plotAxisSigFigs,
        },
        yaxis: {
          type: 'linear',
          exponentformat: 'none',
          automargin: true,
          title: {
            text: yUnits ? `units: ${yUnits}` : undefined,
            font: { color: fontColour },
          },
          tickformat: plotAxisSigFigs,
        },
      }) satisfies Partial<PlotlyLayout> as Partial<PlotlyLayout>,
    [fontColour, plotAxisSigFigs, title, xUnits, yUnits]
  );

  // set the initial options
  const [plotlyLayoutString, setLayoutString] = React.useState(
    JSON.stringify(chartOptions)
  );
  const [plotlyDataString, setDataString] = React.useState('');

  React.useEffect(() => {
    const fontColour = themeMode === 'dark' ? '#ADBABD' : '#444';
    const lineColour =
      themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee';

    setDataString(
      JSON.stringify([
        {
          type: trace.x.length > 1000 ? 'scattergl' : 'scatter', // scattergl has better performance for traces with many points (uses HTML canvas instead of SVG)
          x: trace.x,
          y: trace.y,
          line: {
            color: '#1F77B4', // same colour as trace thumbnails from the backend
            width: 1.5,
          },
          mode: pointsVisible ? 'lines+markers' : 'lines',
        } satisfies Partial<PlotlyPlotData>,
      ])
    );
    const xLimits =
      trace.x.length > 0
        ? {
            min: Math.min(...trace.x),
            max: Math.max(...trace.x),
          }
        : undefined;
    const yLimits =
      trace.y.length > 0
        ? { min: Math.min(...trace.y), max: Math.max(...trace.y) }
        : undefined;
    if (chartOptions.xaxis)
      chartOptions.xaxis = {
        ...chartOptions.xaxis,
        range: xLimits ? [xLimits.min, xLimits.max] : undefined,
        maxallowed: xLimits?.max,
        minallowed: xLimits?.min,
        color: lineColour,
        gridcolor: lineColour,
        tickfont: { color: fontColour },
      };
    if (chartOptions.yaxis)
      chartOptions.yaxis = {
        ...chartOptions.yaxis,
        range: yLimits ? [yLimits.min, yLimits.max] : undefined,
        maxallowed: yLimits?.max,
        minallowed: yLimits?.min,
        color: lineColour,
        gridcolor: lineColour,
        tickfont: { color: fontColour },
      };

    chartOptions.uirevision = `${viewReset}`;

    chartOptions.font = {
      color: fontColour,
    };

    setLayoutString(JSON.stringify(chartOptions));
  }, [chartOptions, trace, pointsVisible, viewReset, themeMode]);

  // This div is turned into a Plotly.js plot via code in windowPortal.component.tsx
  return (
    <div
      ref={chartRef}
      className="plotly-chart"
      data-config={plotlyConfigString}
      data-layout={plotlyLayoutString}
      data-data={plotlyDataString}
    ></div>
  );
};

export default TracePlot;
