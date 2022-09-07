import { Box, ButtonGroup, Button } from '@mui/material';
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
  Record as OGRecord,
  ScalarChannel,
} from '../app.types';
import { format } from 'date-fns';

/**
 *  Exports the graph as SVG
 *  @param svg The SVG element to export
 *  @param title The title of the plot (for the file name)
 */
function exportChart(svg: HTMLElement | null, title: string): void {
  if (svg && svg.firstChild) {
    let svgURL = new XMLSerializer().serializeToString(svg.firstChild);
    let svgBlob = new Blob([svgURL], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = window.URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${title}.svg`;

    link.style.display = 'none';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }
}

/**
 *  Exports the graph data as a CSV
 *  @param data The data to export
 *  @param title The title of the plot (for the file name)
 */
function exportData(data: Record<string, unknown>[], title: string): void {
  const headerRow = Object.keys(data[0]);
  const dataRows = data.map((x) => Object.values(x));
  const csvArray = [headerRow, ...dataRows];

  let csvContent =
    'data:text/csv;charset=utf-8,' +
    csvArray.map((x) => x.join(',')).join('\n');
  var encodedUri = encodeURI(csvContent);

  const link = document.createElement('a');
  link.href = encodedUri;
  link.download = `${title}.csv`;

  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const formatTooltipLabel = (
  label: number,
  scale: AxisSettings['scale']
): number | string => {
  if (scale === 'time') {
    return format(new Date(label), 'yyyy-MM-dd HH:mm:ss:SSS');
  }
  return label;
};

export interface PlotProps {
  data?: Record<string, unknown>[];
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
  XAxis: string;
  YAxis: string;
}

export const Plot = (props: PlotProps) => {
  const { data, title, type, XAxisSettings, YAxesSettings, XAxis, YAxis } =
    props;
  const [redraw, setRedraw] = React.useState(false);
  const setRedrawTrue = React.useCallback(() => {
    setRedraw(true);
  }, [setRedraw]);

  const graphRef = React.useRef<HTMLDivElement | null>(null);
  const svgRef = React.useRef<HTMLElement | null>(null);

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
    <div style={{ width: '100%', height: '100%' }}>
      <Box display="flex" pr={1} pt={1}>
        <ButtonGroup
          size="small"
          aria-label="plot actions"
          sx={{ marginLeft: 'auto' }}
        >
          <Button>Save</Button>
          <Button>Save As</Button>
          <Button onClick={() => exportChart(svgRef.current, title)}>
            Export Plot
          </Button>
          <Button onClick={() => exportData(data ?? [], title)}>
            Export Plot Data
          </Button>
        </ButtonGroup>
      </Box>
      <div
        // need to minus off button height from graph container
        style={{ width: '100%', height: `calc(100% - 38px)` }}
        ref={graphRef}
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
            x={
              graphRef?.current?.offsetWidth
                ? graphRef.current.offsetWidth / 2 - 50
                : 170
            }
            y={20}
            orientation="horizontal"
            data={[{ name: YAxis, symbol: { fill: '#e31a1c' } }]}
          />
          {type === 'line' && (
            <VictoryLine
              style={{
                data: { stroke: '#e31a1c' },
              }}
              data={data}
              x={XAxis}
              y={YAxis}
            />
          )}
          {/* We render a scatter graph no matter what as otherwise line charts wouldn't be able to have hover tooltips */}
          <VictoryScatter
            style={{
              data: { fill: '#e31a1c' },
            }}
            data={data}
            x={XAxis}
            y={YAxis}
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
        </VictoryChart>
      </div>
    </div>
  );
};

export const getFormattedAxisData = (
  record: OGRecord,
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
  records: OGRecord[];
  channels: FullScalarChannelMetadata[];
} & PlotProps;

const ConnectedPlot = (props: ConnectedPlotProps) => {
  const { XAxis, YAxis, records, channels } = props;

  const chartData: Record<string, unknown>[] = React.useMemo(() => {
    const data = records.map((record) => {
      const formattedXAxis = getFormattedAxisData(record, channels, XAxis);
      const formattedYAxis = getFormattedAxisData(record, channels, YAxis);

      // If no valid x or y value, we have no point to plot
      if (!formattedXAxis || !formattedYAxis)
        return { [XAxis]: NaN, [YAxis]: NaN };

      return {
        [XAxis]: formattedXAxis,
        [YAxis]: formattedYAxis,
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
      XAxis={XAxis}
      YAxis={YAxis}
    />
  );
};

export default ConnectedPlot;
