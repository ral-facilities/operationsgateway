import { ButtonGroup, Button } from '@mui/material';
import React from 'react';
import { PlotDataset } from '../app.types';
import { formatTooltipLabel } from './plot.component';

/**
 *  Exports the graph as SVG
 *  @param svg The SVG element to export
 *  @param title The title of the plot (for the file name)
 */
function exportChart(svg: HTMLElement | null, title: string): void {
  if (svg && svg.firstChild) {
    const svgURL = new XMLSerializer().serializeToString(svg.firstChild);
    const svgBlob = new Blob([svgURL], { type: 'image/svg+xml;charset=utf-8' });
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

type DataRow = {
  [column: string]: number;
};

/**
 *  Exports the graph data as a CSV
 *  @param data The data to export
 *  @param title The title of the plot (for the file name)
 */
function exportData(title: string, XAxis: string, plots?: PlotDataset[]): void {
  if (plots && plots.length > 0) {
    const headerRow = [XAxis].concat(plots.map((plot) => plot.name));

    const dataRows: DataRow[] = [];

    plots.forEach((plot) => {
      const plotDataset = plot.data;
      for (let i = 0; i < plotDataset.length; i++) {
        const currentPoint: { [point: string]: number } = plotDataset[i];
        const currentPointXVal = currentPoint[XAxis];
        const currentPointYVal = currentPoint[plot.name];

        const matchingDataRow = dataRows.find(
          (dataRow) => dataRow[XAxis] === currentPointXVal
        );
        let newDataRow: DataRow;
        if (matchingDataRow) {
          newDataRow = {
            ...matchingDataRow,

            [plot.name]: currentPointYVal,
          };
          dataRows[dataRows.indexOf(matchingDataRow)] = newDataRow;
        } else {
          newDataRow = {
            [XAxis]: currentPointXVal,

            [plot.name]: currentPointYVal,
          };
          dataRows.push(newDataRow);
        }
      }
    });

    const sortedDataRows = dataRows.sort((row1, row2) => {
      const row1XVal = row1[XAxis];
      const row2XVal = row2[XAxis];

      if (row1XVal > row2XVal) return 1;
      if (row1XVal < row2XVal) return -1;
      return 0;
    });

    const finalPrintedRows = sortedDataRows.map((dataRow) => {
      return headerRow.map((header) => {
        if (Object.keys(dataRow).includes(header)) {
          return header === 'timestamp'
            ? formatTooltipLabel(dataRow[header], 'time')
            : dataRow[header];
        }
        return '';
      });
    });

    const csvArray = [headerRow, ...finalPrintedRows];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvArray.map((x) => x.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);

    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `${title}.csv`;

    link.style.display = 'none';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

interface PlotButtonsProps {
  data?: PlotDataset[];
  svgRef: React.MutableRefObject<HTMLElement | null>;
  title: string;
  XAxis: string;
}

const PlotButtons = (props: PlotButtonsProps) => {
  const { data, svgRef, title, XAxis } = props;
  return (
    <ButtonGroup size="small" aria-label="plot actions">
      {/* TODO: link these buttons up to save graph config to redux/session */}
      <Button>Save</Button>
      <Button>Save As</Button>
      <Button onClick={() => exportChart(svgRef.current, title)}>
        Export Plot
      </Button>
      <Button onClick={() => exportData(title, XAxis, data)}>
        Export Plot Data
      </Button>
    </ButtonGroup>
  );
};

export default PlotButtons;
