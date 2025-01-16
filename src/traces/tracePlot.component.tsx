import React from 'react';
import { Waveform } from '../app.types';
// only import types as we don't actually run any plotly.js code in React
import type {
  Config as PlotlyConfig,
  Layout as PlotlyLayout,
  PlotData as PlotlyPlotData,
} from 'plotly.js';
import { useTheme } from '@mui/material';

export interface TracePlotProps {
  trace: Waveform;
  title: string;
  chartRef: React.MutableRefObject<HTMLDivElement | null>;
  viewReset: boolean;
  pointsVisible: boolean;
}

const plotlyConfigString = JSON.stringify({
  scrollZoom: true,
  displaylogo: false,
  displayModeBar: false,
  responsive: true,
  showAxisDragHandles: false,
} satisfies Partial<PlotlyConfig>);

const TracePlot = (props: TracePlotProps) => {
  const { trace, title, chartRef: chartRef, viewReset, pointsVisible } = props;

  const {
    palette: { mode: themeMode },
  } = useTheme();

  const chartOptions = React.useMemo(
    () =>
      ({
        paper_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
        plot_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
        title: {
          text: title,
        },
        margin: {
          l: 5,
          r: 5,
          b: 5,
          t: 35,
        },
        showlegend: false,
        xaxis: {
          type: 'linear',
          exponentformat: 'none',
          automargin: true,
        },
        yaxis: {
          type: 'linear',
          exponentformat: 'none',
          automargin: true,
        },
      }) satisfies Partial<PlotlyLayout> as Partial<PlotlyLayout>,
    [title]
  );

  // set the initial options
  const [plotlyLayoutString, setOptionsString] = React.useState(
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
    const xLimits = { min: Math.min(...trace.x), max: Math.max(...trace.x) };
    const yLimits = { min: Math.min(...trace.y), max: Math.max(...trace.y) };
    if (chartOptions.xaxis)
      chartOptions.xaxis = {
        ...chartOptions.xaxis,
        range: [xLimits.min, xLimits.max],
        maxallowed: xLimits.max,
        minallowed: xLimits.min,
        color: lineColour,
        gridcolor: lineColour,
        tickfont: { color: fontColour },
      };
    if (chartOptions.yaxis)
      chartOptions.yaxis = {
        ...chartOptions.yaxis,
        range: [yLimits.min, yLimits.max],
        maxallowed: yLimits.max,
        minallowed: yLimits.min,
        color: lineColour,
        gridcolor: lineColour,
        tickfont: { color: fontColour },
      };

    chartOptions.uirevision = `${viewReset}`;

    chartOptions.font = {
      color: fontColour,
    };

    setOptionsString(JSON.stringify(chartOptions));
  }, [chartOptions, trace, pointsVisible, viewReset, themeMode]);

  return (
    <div
      style={{
        flex: '1 0 0',
        maxHeight: 'calc(100vh - 38px)',
        maxWidth: 'calc(100% - 150px)',
      }}
    >
      {/* This div is turned into a Plotly.js plot via code in windowPortal.component.tsx */}
      <div
        ref={chartRef}
        className="plotly-chart"
        data-config={plotlyConfigString}
        data-layout={plotlyLayoutString}
        data-data={plotlyDataString}
      ></div>
    </div>
  );
};

export default TracePlot;
