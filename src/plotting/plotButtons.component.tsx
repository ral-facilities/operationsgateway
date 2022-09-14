import { ButtonGroup, Button } from '@mui/material';
import React from 'react';
import { formatTooltipLabel } from './plot.component';

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
function exportData(
  data: Record<string, number | Date>[] | undefined,
  title: string
): void {
  if (data && data.length > 0) {
    const headerRow = Object.keys(data[0]);
    const dataRows = data.map((x) =>
      Object.values(x).map((y) => formatTooltipLabel(y))
    );
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
}

interface PlotButtonsProps {
  data?: Record<string, number | Date>[];
  svgRef: React.MutableRefObject<HTMLElement | null>;
  title: string;
}

const PlotButtons = (props: PlotButtonsProps) => {
  const { data, svgRef, title } = props;
  return (
    <ButtonGroup size="small" aria-label="plot actions">
      {/* TODO: link these buttons up to save graph config to redux/session */}
      <Button>Save</Button>
      <Button>Save As</Button>
      <Button onClick={() => exportChart(svgRef.current, title)}>
        Export Plot
      </Button>
      <Button onClick={() => exportData(data, title)}>Export Plot Data</Button>
    </ButtonGroup>
  );
};

export default PlotButtons;
