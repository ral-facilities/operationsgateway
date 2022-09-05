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
} from 'victory';
import {
  AxisSettings,
  FullScalarChannelMetadata,
  PlotType,
  Record,
  ScalarChannel,
} from '../app.types';

interface PlotProps {
  data?: unknown[];
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
}

export const Plot = (props: PlotProps) => {
  const { data, title, type, XAxisSettings, YAxesSettings } = props;
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
    <div style={{ width: '100%', height: '100%' }} ref={graphRef}>
      <VictoryChart
        containerComponent={<VictoryZoomContainer />}
        scale={{ x: XAxisSettings.scale, y: YAxesSettings.scale }}
        theme={VictoryTheme.material}
        width={graphRef?.current?.offsetWidth ?? 0}
        height={graphRef?.current?.offsetHeight ?? 0}
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
          x={
            graphRef?.current?.offsetWidth
              ? graphRef.current.offsetWidth / 2 - 50
              : 170
          }
          y={20}
          orientation="horizontal"
          data={[{ name: 'shotnum', symbol: { fill: '#e31a1c' } }]}
        />
        {type === 'line' && (
          <VictoryLine
            style={{
              data: { stroke: '#e31a1c' },
            }}
            data={data}
            x="timestamp"
            y="shotnum"
          />
        )}
        {/* We render a scatter graph no matter what as otherwise line charts wouldn't be able to have hover tooltips */}
        <VictoryScatter
          style={{
            data: { fill: '#e31a1c' },
          }}
          data={data}
          x="timestamp"
          y="shotnum"
          size={type === 'line' ? 2 : 3}
          labels={({ datum }) => `(${datum._x}, ${datum._y})`}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </div>
  );
};

export const getFormattedAxisData = (
  record: Record,
  scalarChannels: FullScalarChannelMetadata[],
  axisName: string
): number => {
  let formattedData = NaN;

  switch (axisName) {
    case 'timestamp':
      formattedData = new Date(record.metadata.timestamp).getTime();
      break;
    case 'shotnum':
      formattedData = record.metadata.shotnum ?? NaN;
      break;
    case 'activeArea':
      formattedData = parseInt(record.metadata.activeArea);
      break;
    case 'activeExperiment':
      formattedData = record.metadata.activeExperiment
        ? parseInt(record.metadata.activeExperiment)
        : NaN;
      break;
    default:
      const systemNames = scalarChannels.map((channel) => channel.systemName);
      if (systemNames.includes(axisName)) {
        const channel: ScalarChannel = record.channels[
          axisName
        ] as ScalarChannel;
        formattedData =
          typeof channel.data === 'number'
            ? channel.data
            : parseFloat(channel.data);
      }
  }

  return formattedData;
};

export type ConnectedPlotProps = {
  records: Record[];
  channels: FullScalarChannelMetadata[];
  XAxis: string;
  YAxis: string;
} & PlotProps;

const ConnectedPlot = (props: ConnectedPlotProps) => {
  const { XAxis, YAxis, records, channels } = props;

  const chartData: unknown[] = React.useMemo(() => {
    const data = records.map((record) => {
      const formattedXAxis = getFormattedAxisData(record, channels, XAxis);
      const formattedYAxis = getFormattedAxisData(record, channels, YAxis);

      // If no valid x or y value, we have no point to plot
      if (!formattedXAxis || !formattedYAxis) return { x: NaN, y: NaN };

      return {
        x: formattedXAxis,
        y: formattedYAxis,
      };
    });
    return data;
  }, [XAxis, YAxis, channels, records]);

  return (
    <Plot
      data={chartData}
      title={props.title}
      type={props.type}
      XAxisSettings={props.XAxisSettings}
      YAxesSettings={props.YAxesSettings}
    />
  );
};

export default ConnectedPlot;
