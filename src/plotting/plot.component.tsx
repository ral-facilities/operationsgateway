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
import { AxisSettings, PlotType } from '../app.types';
import { format } from 'date-fns';

export const formatTooltipLabel = (label: number | Date): number | string => {
  if (label instanceof Date) {
    return format(label, 'yyyy-MM-dd HH:mm:ss');
  }
  return label;
};

export interface PlotProps {
  datasets?: plotDataset[];
  // data?: { [channel: string]: number | Date }[];
  title: string;
  type: PlotType;
  XAxisSettings: AxisSettings;
  YAxesSettings: AxisSettings;
  XAxis: string;
  // YAxis: string;
  svgRef: React.MutableRefObject<HTMLElement | null>;
}

const Plot = (props: PlotProps) => {
  const {
    // data,
    datasets,
    title,
    type,
    XAxisSettings,
    YAxesSettings,
    XAxis,
    // YAxis,
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
          data={datasets?.map((dataset) => {
            return { name: dataset.name, symbol: { fill: '#e31a1c' } };
          })}
        />
        {datasets?.map((dataset) => (
          <VictoryGroup
            key={dataset.name}
            // data={dataset.data}
            // x={XAxis}
            // y={dataset.name}
          >
            {type === 'line' && (
              <VictoryLine
                style={{
                  data: { stroke: '#e31a1c' },
                }}
                data={dataset.data}
                x={XAxis}
                y={dataset.name}
              />
            )}
            {/* We render a scatter graph no matter what as otherwise line charts
            wouldn't be able to have hover tooltips */}
            <VictoryScatter
              style={{
                data: { fill: '#e31a1c' },
              }}
              data={dataset.data}
              x={XAxis}
              y={dataset.name}
              size={type === 'line' ? 2 : 3}
              labels={({ datum }) => {
                const formattedXLabel = formatTooltipLabel(datum._x);
                const formattedYLabel = formatTooltipLabel(datum._y);
                return `(${formattedXLabel}, ${formattedYLabel})`;
              }}
              labelComponent={<VictoryTooltip />}
            />
          </VictoryGroup>
        ))}
      </VictoryChart>
    </div>
  );
};

// export const getFormattedAxisData = (
//   record: Record,
//   scalarChannels: FullScalarChannelMetadata[],
//   axisName: string
// ): number => {
//   let formattedData = NaN;

//   switch (axisName) {
//     case 'timestamp':
//       formattedData = new Date(record.metadata.timestamp).getTime();
//       break;
//     case 'shotnum':
//       formattedData = record.metadata.shotnum ?? NaN;
//       break;
//     case 'activeArea':
//       formattedData = parseInt(record.metadata.activeArea);
//       break;
//     case 'activeExperiment':
//       formattedData = record.metadata.activeExperiment
//         ? parseInt(record.metadata.activeExperiment)
//         : NaN;
//       break;
//     default:
//       const systemNames = scalarChannels.map((channel) => channel.systemName);
//       if (systemNames.includes(axisName)) {
//         const channel: ScalarChannel = record.channels[
//           axisName
//         ] as ScalarChannel;
//         formattedData =
//           typeof channel.data === 'number'
//             ? channel.data
//             : parseFloat(channel.data);
//       }
//   }

//   return formattedData;
// };

type plotDataset = {
  name: string;
  data: {
    [point: string]: number | Date;
  }[];
};

// export type ConnectedPlotProps = {
//   records: Record[];
//   channels: FullScalarChannelMetadata[];
//   selectedChannels: string[];
// } & PlotProps;

// const ConnectedPlot = (props: ConnectedPlotProps) => {
//   const { XAxis, selectedChannels, records, channels } = props;

//   const plotDatasets: plotDataset[] = [];

//   selectedChannels.forEach((plotChannelName) => {
//     // Add the initial entry for dataset called plotChannelName
//     // data field is currently empty, the below loop populates it
//     const newDataset: plotDataset = {
//       name: plotChannelName,
//       data: [],
//     };

//     // Populate the above data field
//     records.forEach((record) => {
//       const formattedXAxis = getFormattedAxisData(record, channels, XAxis);
//       const formattedYAxis = getFormattedAxisData(
//         record,
//         channels,
//         plotChannelName
//       );

//       if (formattedXAxis && formattedYAxis) {
//         const currentData = newDataset.data;
//         currentData.push({
//           [XAxis]: formattedXAxis,
//           [plotChannelName]: formattedYAxis,
//         });
//       }
//     });

//     plotDatasets.push(newDataset);
//   });

//   return (
//     <Plot
//       datasets={plotDatasets}
//       title={props.title}
//       type={props.type}
//       XAxisSettings={props.XAxisSettings}
//       YAxesSettings={props.YAxesSettings}
//       XAxis={XAxis}
//     />
//   );
// };

// export default ConnectedPlot;
export default Plot;
