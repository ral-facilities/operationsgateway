import React from 'react';
import { type Vector } from '../app.types';
// only import types as we don't actually run any plotly.js code in React
import { useTheme } from '@mui/material';
import type {
  Config as PlotlyConfig,
  Layout as PlotlyLayout,
  PlotData as PlotlyPlotData,
} from 'plotly.js';

export interface VectorPlotProps {
  vector: Vector;
  labels: string[];
  units?: string;
  title: string;
  chartRef: React.MutableRefObject<HTMLDivElement | null>;
  viewReset: boolean;
}

const plotlyConfigString = JSON.stringify({
  scrollZoom: true,
  displaylogo: false,
  displayModeBar: false,
  responsive: true,
  showAxisDragHandles: false,
  showTips: false,
} satisfies Partial<PlotlyConfig>);

const VectorPlot = (props: VectorPlotProps) => {
  const { vector, labels, units, title, chartRef: chartRef, viewReset } = props;
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
          exponentformat: 'none',
          automargin: true,
          title: { text: units ? `units: ${units}` : undefined },
        },
        yaxis: {
          exponentformat: 'none',
          automargin: true,
        },
      }) satisfies Partial<PlotlyLayout> as Partial<PlotlyLayout>,
    [title, units]
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
    const vectorData = {
      x: labels,
      y: vector.data,
    };
    setDataString(
      JSON.stringify([
        {
          type: 'bar',
          x: vectorData.x,
          y: vectorData.y,
        } satisfies Partial<PlotlyPlotData>,
      ])
    );

    const yLimits = {
      min: Math.min(...vectorData.y),
      max: Math.max(...vectorData.y),
    };
    if (chartOptions.xaxis)
      chartOptions.xaxis = {
        ...chartOptions.xaxis,
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
  }, [chartOptions, vector, viewReset, themeMode, labels]);

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

export default VectorPlot;
