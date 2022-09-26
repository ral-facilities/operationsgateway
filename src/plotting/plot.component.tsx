import React from 'react';
import {
  VictoryChart,
  VictoryScatter,
  VictoryLine,
  VictoryZoomContainer,
  VictoryLabel,
  VictoryTheme,
  VictoryLegend,
  VictoryTooltip,
  VictoryGroup,
} from 'victory';
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
  selectedPlotChannels: SelectedPlotChannel[];
  title: string;
  type: PlotType;
  XAxisSettings: XAxisSettings;
  YAxesSettings: YAxisSettings;
  XAxis: string;
  svgRef: React.MutableRefObject<HTMLElement | null>;
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
    svgRef,
  } = props;
  const [redraw, setRedraw] = React.useState(false);
  const setRedrawTrue = React.useCallback(() => {
    setRedraw(true);
  }, [setRedraw]);

  const graphRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    window.addEventListener(
      `resize OperationsGateway Plot - ${title}`,
      setRedrawTrue,
      false
    );
    return () => {
      window.removeEventListener(
        `resize OperationsGateway Plot - ${title}`,
        setRedrawTrue,
        false
      );
    };
  }, [setRedrawTrue, title]);

  // reset redraw state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (redraw) {
      setRedraw(false);
    }
  });

  return (
    <div
      ref={graphRef}
      style={{
        flex: '1 0 0',
        maxHeight: 'calc(100% - 38px)',
        maxWidth: '100%',
      }}
    >
      <VictoryChart
        containerComponent={
          <VictoryZoomContainer
            containerRef={(ref) => {
              svgRef.current = ref;
            }}
          />
        }
        scale={{ x: XAxisSettings.scale, y: YAxesSettings.scale }}
        theme={VictoryTheme.material}
        width={graphRef?.current?.offsetWidth ?? 0}
        height={graphRef?.current?.offsetHeight ?? 0}
        // might need something fancier than this to prevent label overflow...
        // this can render 6 characters without overflow
        padding={{ top: 50, left: 60, right: 50, bottom: 50 }}
      >
        <VictoryLabel
          text={title}
          x={
            graphRef?.current?.offsetWidth
              ? graphRef.current.offsetWidth / 2
              : 200
          }
          y={10}
          textAnchor="middle"
        />
        <VictoryLegend
          x={50}
          y={20}
          gutter={20}
          symbolSpacer={5}
          orientation="horizontal"
          data={selectedPlotChannels
            ?.filter((channel) => channel.options.visible)
            .map((channel) => {
              return { name: channel.name, symbol: { fill: '#e31a1c' } };
            })}
        />
        {selectedPlotChannels.map((channel) => {
          const currentDataset = datasets.find(
            (dataset) => dataset.name === channel.name
          );
          if (currentDataset) {
            return (
              <VictoryGroup key={currentDataset.name}>
                {type === 'line' && (
                  <VictoryLine
                    style={{
                      data: {
                        stroke: '#e31a1c',
                        strokeOpacity: channel.options.visible ? 1 : 0,
                      },
                    }}
                    data={currentDataset.data}
                    x={XAxis}
                    y={currentDataset.name}
                  />
                )}
                {/* We render a scatter graph no matter what as otherwise line charts
                wouldn't be able to have hover tooltips */}
                <VictoryScatter
                  style={{
                    data: {
                      fill: '#e31a1c',
                      fillOpacity: channel.options.visible ? 1 : 0,
                    },
                  }}
                  data={currentDataset.data}
                  x={XAxis}
                  y={currentDataset.name}
                  size={type === 'line' ? 2 : 3}
                  labels={({ datum }) => {
                    const formattedXLabel = formatTooltipLabel(
                      datum._x,
                      XAxisSettings.scale
                    );
                    const formattedYLabel = formatTooltipLabel(
                      datum._y,
                      YAxesSettings.scale
                    );
                    return `(${formattedXLabel}, ${formattedYLabel})`;
                  }}
                  labelComponent={<VictoryTooltip />}
                />
              </VictoryGroup>
            );
          } else {
            return <></>;
          }
        })}
      </VictoryChart>
    </div>
  );
};

export default Plot;
