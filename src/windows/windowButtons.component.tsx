import { ButtonGroup, Button } from '@mui/material';
import React from 'react';
import {
  PlotDataset,
  XAxisScale,
  timeChannelName,
  Waveform,
  SelectedPlotChannel,
} from '../app.types';
import { format } from 'date-fns';

export const formatTooltipLabel = (
  label: number,
  scale: XAxisScale
): number | string => {
  if (scale === 'time') {
    return format(label, 'yyyy-MM-dd HH:mm:ss');
  }
  return label;
};

/**
 *  Exports the graph as PNG
 *  @param canvas The canvas element to export
 *  @param title The title of the plot (for the file name)
 */
function exportChart(canvas: HTMLCanvasElement | null, title: string): void {
  if (canvas) {
    const dataUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${title}.png`;

    link.style.display = 'none';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

/**
 *  Exports an image as PNG
 *  @param title The filename
 *  @param objectUrl The object url of the PNG to download
 */
function exportImage(filename: string, objectUrl?: string): void {
  if (objectUrl) {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${filename}.png`;

    link.style.display = 'none';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

/**
 * A custom type for mapping an X value in a plot to multiple Y values
 * This can be used to represent one row of data in a CSV file
 *
 * Each DataRow has an X value and at least one other value
 */
type DataRow = {
  [column: string]: number;
};

export const constructDataRows = (
  XAxis: string,
  plots: PlotDataset[],
  selectedPlotChannels: SelectedPlotChannel[]
): (string | number)[][] => {
  // First row of file, i.e. the column names
  const headerRow = [XAxis].concat(plots.map((plot) => plot.name));
  // First row of file with units, i.e. the column names
  const headerRowWithUnits = [XAxis].concat(
    plots.map((plot) => {
      const channel = selectedPlotChannels.find(
        (channel) => channel.name === plot.name
      );

      return `${channel?.displayName}/${channel?.name}/${channel?.units}`;
    })
  );

  const dataRows: DataRow[] = [];

  // For each plotted dataset, extract data points and add to array of data rows
  plots.forEach((plot) => {
    const plotDataset = plot.data;
    for (let i = 0; i < plotDataset.length; i++) {
      const currentPoint: { [x: string]: number } = plotDataset[i];

      // Extract the X and Y values for this point in the dataset
      const currentPointXVal = currentPoint[XAxis];
      const currentPointYVal = currentPoint[plot.name];

      // See if we already have a data row matching this X value
      const matchingDataRow = dataRows.find(
        (dataRow) => dataRow[XAxis] === currentPointXVal
      );
      let newDataRow: DataRow;
      if (matchingDataRow) {
        // Found matching data row, add a "column" to it for this piece of data
        newDataRow = {
          ...matchingDataRow,

          [plot.name]: currentPointYVal,
        };
        dataRows[dataRows.indexOf(matchingDataRow)] = newDataRow;
      } else {
        // Make a new data row for this X value
        newDataRow = {
          [XAxis]: currentPointXVal,

          [plot.name]: currentPointYVal,
        };
        dataRows.push(newDataRow);
      }
    }
  });

  // Sort by X value ascending
  const sortedDataRows = dataRows.sort((row1, row2) => {
    const row1XVal = row1[XAxis];
    const row2XVal = row2[XAxis];

    if (row1XVal > row2XVal) return 1;
    return -1;
  });

  // Transform the DataRow array into a 2D array of data, corresponding to rows in CSV
  // This is usually numbered data but is string in the case of formatted timestamps
  const finalCsvRows: (string | number)[][] = sortedDataRows.map((dataRow) => {
    return headerRow.map((header) => {
      if (Object.keys(dataRow).includes(header)) {
        return header === timeChannelName
          ? formatTooltipLabel(dataRow[header], 'time')
          : dataRow[header];
      }
      return '';
    });
  });

  return [headerRowWithUnits, ...finalCsvRows];
};

/**
 *  Common functionality to take a 2D array and create and download a CSV file
 *  @param csvArray The data to create the CSV from
 *  @param filename filename to use for the CSV file
 */
function createAndDownloadCSV(csvArray: unknown[][], filename: string) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    csvArray.map((x) => x.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement('a');
  link.href = encodedUri;
  link.download = `${filename}.csv`;

  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 *  Exports the graph data as a CSV
 *  @param title The title of the plot (for the file name)
 *  @param XAxis the name of the X axis
 *  @param plots The data to export
 */
function exportPlotData(
  title: string,
  XAxis?: string,
  plots?: PlotDataset[],
  selectedPlotChannels?: SelectedPlotChannel[]
): void {
  if (
    XAxis &&
    plots &&
    plots.length > 0 &&
    selectedPlotChannels &&
    selectedPlotChannels.length > 0
  ) {
    const csvArray = constructDataRows(XAxis, plots, selectedPlotChannels);

    createAndDownloadCSV(csvArray, title);
  }
}

/**
 *  Exports the trace data as a CSV
 *  @param title The title of the trace (for the file name)
 *  @param trace The trace to export
 */
function exportTraceData(title: string, trace?: Waveform): void {
  if (trace) {
    const csvArray = [
      ['x', 'y'],
      ...trace.x.map((x, index) => [x, trace.y[index]]),
    ];

    createAndDownloadCSV(csvArray, title);
  }
}

interface CommonButtonsProps {
  title: string;
  resetView: () => void;
}

export interface PlotButtonsProps extends CommonButtonsProps {
  data?: PlotDataset[];
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  XAxis?: string;
  gridVisible: boolean;
  axesLabelsVisible: boolean;
  toggleGridVisibility: () => void;
  toggleAxesLabelsVisibility: () => void;
  resetView: () => void;
  savePlot: () => void;
  selectedPlotChannels: SelectedPlotChannel[];
}

export const PlotButtons = (props: PlotButtonsProps) => {
  const {
    data,
    canvasRef,
    title,
    XAxis,
    gridVisible,
    axesLabelsVisible,
    toggleGridVisibility,
    toggleAxesLabelsVisibility,
    resetView,
    savePlot,
    selectedPlotChannels,
  } = props;

  return (
    <ButtonGroup size="small" aria-label="plot actions">
      <Button onClick={() => resetView()}>Reset View</Button>
      <Button onClick={() => toggleGridVisibility()}>
        {gridVisible ? 'Hide Grid' : 'Show Grid'}
      </Button>
      <Button onClick={() => toggleAxesLabelsVisibility()}>
        {axesLabelsVisible ? 'Hide Axes Labels' : 'Show Axes Labels'}
      </Button>
      <Button onClick={() => savePlot()}>Save</Button>
      <Button onClick={() => exportChart(canvasRef.current, title)}>
        Export Plot
      </Button>
      <Button
        onClick={() => exportPlotData(title, XAxis, data, selectedPlotChannels)}
      >
        Export Plot Data
      </Button>
    </ButtonGroup>
  );
};

export interface TraceButtonsProps extends CommonButtonsProps {
  data?: Waveform;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  pointsVisible: boolean;
  togglePointsVisibility: () => void;
}

export const TraceButtons = (props: TraceButtonsProps) => {
  const {
    data,
    canvasRef,
    title,
    resetView,
    pointsVisible,
    togglePointsVisibility,
  } = props;

  return (
    <ButtonGroup size="small" aria-label="plot actions">
      <Button onClick={() => resetView()}>Reset View</Button>
      <Button onClick={() => togglePointsVisibility()}>
        {pointsVisible ? 'Hide Points' : 'Show Points'}
      </Button>
      <Button onClick={() => exportChart(canvasRef.current, title)}>
        Export Plot
      </Button>
      <Button onClick={() => exportTraceData(title, data)}>
        Export Plot Data
      </Button>
    </ButtonGroup>
  );
};

export interface ImageButtonsProps extends CommonButtonsProps {
  data?: string;
}

export const ImageButtons = (props: ImageButtonsProps) => {
  const { data, title, resetView } = props;

  return (
    <ButtonGroup size="small" aria-label="plot actions">
      <Button onClick={() => resetView()}>Reset View</Button>
      <Button onClick={() => exportImage(title, data)}>Export Image</Button>
    </ButtonGroup>
  );
};
