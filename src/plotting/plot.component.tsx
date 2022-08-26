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
import { useRecords } from '../api/records';
import { AxisSettings, PlotType } from '../app.types';

type FullPlotProps = {
  data?: unknown[];
} & PlotProps;

export const Plot = (props: FullPlotProps) => {
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
          data={[{ name: 'shotNum', symbol: { fill: '#e31a1c' } }]}
        />
        {type === 'line' && (
          <VictoryLine
            style={{
              data: { stroke: '#e31a1c' },
            }}
            data={data}
            x="timestamp"
            y="shotNum"
          />
        )}
        {/* We render a scatter graph no matter what as otherwise line charts wouldn't be able to have hover tooltips */}
        <VictoryScatter
          style={{
            data: { fill: '#e31a1c' },
          }}
          data={data}
          x="timestamp"
          y="shotNum"
          size={type === 'line' ? 2 : 3}
          labels={({ datum }) => `(${datum._x}, ${datum._y})`}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </div>
  );
};

interface PlotProps {
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
}

const ConnectedPlot = (props: PlotProps) => {
  const { data: records } = useRecords();

  const chartData: unknown[] = React.useMemo(() => {
    const data =
      records?.map((record) => ({
        timestamp: parseInt(record.metadata.timestamp),
        shotNum: record.metadata.shotNum ?? NaN,
      })) ?? [];
    return data;
  }, [records]);

  return (
    <div
      className="chart-container"
      style={{ position: 'relative', height: '100%', width: '100%' }}
    >
      <Plot data={chartData} {...props} />
    </div>
  );
};

export default ConnectedPlot;
