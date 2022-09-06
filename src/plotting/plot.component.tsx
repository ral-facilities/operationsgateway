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
import { useRecords } from '../api/records';
import { AxisSettings, PlotType } from '../app.types';

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

type FullPlotProps = {
  data?: Record<string, unknown>[];
} & PlotProps;

export const Plot = (props: FullPlotProps) => {
  const { data, title, type, XAxisSettings, YAxesSettings } = props;
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
    <div style={{ width: 'inherit', height: 'inherit' }}>
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

  const chartData: Record<string, unknown>[] = React.useMemo(() => {
    const data =
      records?.map((record) => ({
        timestamp: new Date(record.metadata.timestamp).getTime(),
        shotnum: record.metadata.shotnum ?? NaN,
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
