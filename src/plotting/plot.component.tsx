import React from 'react';
import {
  PlotDataset,
  PlotType,
  SelectedPlotChannel,
  XAxisScale,
  YAxisScale,
} from '../app.types';
// only import types as we don't actually run any plotly.js code in React
import type {
  Config as PlotlyConfig,
  Layout as PlotlyLayout,
  PlotData as PlotlyPlotData,
} from 'plotly.js';
import { useTheme } from '@mui/material';
import type { WorkingHours } from '../settings';

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
  chartRef: React.MutableRefObject<HTMLDivElement | null>;
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
  workingHours: WorkingHours;
  skipNonBusinessHours: boolean;
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
    chartRef,
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
    workingHours,
    skipNonBusinessHours,
  } = props;

  const {
    palette: { mode: themeMode },
  } = useTheme();

  const [plotlyLayoutString, setPlotlyLayoutString] = React.useState(
    JSON.stringify({} satisfies Partial<PlotlyLayout>)
  );

  const [plotlyConfigString] = React.useState(
    JSON.stringify({
      scrollZoom: true,
      displaylogo: false,
      displayModeBar: false,
      responsive: true,
      showAxisDragHandles: false,
      showTips: false,
    } satisfies Partial<PlotlyConfig>)
  );

  const [plotlyDataString, setPlotlyDataString] = React.useState(
    JSON.stringify([])
  );

  React.useEffect(() => {
    const fontColour = themeMode === 'dark' ? '#ADBABD' : '#444';
    const lineColour =
      themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee';

    const xMin =
      XAxisScale === 'log' && xMinimum ? Math.log10(xMinimum) : xMinimum;
    const xMax =
      XAxisScale === 'log' && xMaximum ? Math.log10(xMaximum) : xMaximum;
    const leftYAxisMin =
      leftYAxisScale === 'log' && leftYAxisMinimum
        ? Math.log10(leftYAxisMinimum)
        : leftYAxisMinimum;
    const leftYAxisMax =
      leftYAxisScale === 'log' && leftYAxisMaximum
        ? Math.log10(leftYAxisMaximum)
        : leftYAxisMaximum;
    const rightYAxisMin =
      rightYAxisScale === 'log' && rightYAxisMinimum
        ? Math.log10(rightYAxisMinimum)
        : rightYAxisMinimum;
    const rightYAxisMax =
      rightYAxisScale === 'log' && rightYAxisMaximum
        ? Math.log10(rightYAxisMaximum)
        : rightYAxisMaximum;
    setPlotlyLayoutString(
      JSON.stringify({
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
        uirevision: `${viewReset}`,
        paper_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
        plot_bgcolor: 'rgba(0, 0, 0, 0)', // make plot background transparent
        font: {
          color: fontColour,
        },
        legend: {
          orientation: 'h',
          x: 0.5,
          yanchor: 'bottom',
          xanchor: 'center',
          yref: 'container',
        },
        xaxis: {
          title: {
            text: axesLabelsVisible ? (XAxisDisplayName ?? XAxis) : undefined,
            font: { color: fontColour },
          },
          type: XAxisScale,
          showgrid: gridVisible,
          range: [xMin ?? null, xMax ?? null],
          minallowed: xMin,
          maxallowed: xMax,
          ...(XAxisScale === 'date' && skipNonBusinessHours
            ? {
                rangebreaks: [
                  { pattern: 'day of week', bounds: ['sat', 'mon'] }, // skips from saturday to monday
                  {
                    pattern: 'hour',
                    bounds: [workingHours.end, workingHours.start],
                  }, // skips from end to start as defined in the config
                ],
              }
            : {}),
          color: lineColour,
          gridcolor: lineColour,
          tickfont: { color: fontColour },
          automargin: true,
          exponentformat: 'none',
        },
        yaxis: {
          title: {
            text: axesLabelsVisible ? leftYAxisLabel : undefined,
            font: { color: fontColour },
          },
          type: leftYAxisScale,
          showgrid: gridVisible,
          visible: selectedPlotChannels.some(
            (channel) =>
              channel.options.yAxis === 'left' && channel.options.visible
          ),
          range: [leftYAxisMin ?? null, leftYAxisMax ?? null],
          minallowed: leftYAxisMin,
          maxallowed: leftYAxisMax,
          color: lineColour,
          gridcolor: lineColour,
          tickfont: { color: fontColour },
          tickprefix: axesLabelsVisible && leftYAxisLabel ? ' ' : undefined, // add a bit of spacing between axis label & tick labels
          automargin: true,
          exponentformat: 'none',
        },
        yaxis2: {
          title: {
            text: axesLabelsVisible ? rightYAxisLabel : undefined,
            font: { color: fontColour },
          },
          type: rightYAxisScale,
          visible: selectedPlotChannels.some(
            (channel) =>
              channel.options.yAxis === 'right' && channel.options.visible
          ),
          side: 'right',
          overlaying: 'y',
          showgrid: gridVisible,
          range: [rightYAxisMin ?? null, rightYAxisMax ?? null],
          minallowed: rightYAxisMin,
          maxallowed: rightYAxisMax,
          color: lineColour,
          gridcolor: lineColour,
          tickfont: { color: fontColour },
          ticksuffix: axesLabelsVisible && rightYAxisLabel ? ' ' : undefined, // add a bit of spacing between axis label & tick labels
          automargin: true,
          exponentformat: 'none',
        },
      } satisfies Partial<PlotlyLayout>)
    );
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
    viewReset,
    themeMode,
    skipNonBusinessHours,
    workingHours.end,
    workingHours.start,
  ]);

  React.useEffect(() => {
    setPlotlyDataString(
      JSON.stringify(
        datasets.map((dataset) => {
          const {
            options: channelConfig,
            displayName,
            units,
          } = selectedPlotChannels.find(
            (channel) => channel.name === dataset.name
          ) ?? {};
          const lineStyle = channelConfig?.lineStyle ?? 'solid';
          const lineWidth = channelConfig?.lineWidth ?? 3;
          const markerStyle = channelConfig?.markerStyle
            ? channelConfig.markerStyle
            : 'circle';
          const markerSize = channelConfig?.markerSize ?? 6;
          const displayNameWithUnits = units
            ? `${displayName} (${units})`
            : `${displayName}`;

          return {
            type: 'scatter',
            mode:
              type === 'line'
                ? channelConfig?.markerStyle === false
                  ? 'lines'
                  : 'lines+markers'
                : 'markers',
            name: displayNameWithUnits ?? dataset.name,
            x: XAxis ? dataset.data.map((point) => point[XAxis]) : [],
            y: dataset.data.map((point) => point[dataset.name]),
            yaxis: channelConfig?.yAxis === 'right' ? 'y2' : 'y',
            marker: {
              color: channelConfig?.colour,
              opacity:
                channelConfig?.markerStyle === false ||
                channelConfig?.visible === false
                  ? 0
                  : 1,
              size: markerSize,
              symbol: markerStyle,
              line: {
                color: channelConfig?.colour,
                width: 1,
              },
            },
            line: {
              color:
                channelConfig?.visible === false
                  ? 'rgba(0,0,0,0)'
                  : channelConfig?.colour,
              width: lineWidth,
              dash: lineStyle,
            },
            ...(channelConfig?.visible === false
              ? {
                  showlegend: false,
                  hoverinfo: 'skip',
                }
              : {
                  showlegend: true, // explicitly set to true to ensure legend visible for plots with only 1 trace
                  hovertemplate:
                    XAxisScale === 'date'
                      ? `(%{x|%Y-%m-%d %H:%M:%S}, %{y}) ${displayNameWithUnits ?? dataset.name}<extra></extra>`
                      : `(%{x}, %{y}) ${displayNameWithUnits ?? dataset.name}<extra></extra>`,
                }),
          } satisfies Partial<PlotlyPlotData>;
        })
      )
    );
  }, [datasets, XAxis, selectedPlotChannels, type, XAxisScale]);

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

export default Plot;
