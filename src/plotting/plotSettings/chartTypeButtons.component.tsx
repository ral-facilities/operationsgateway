import React from 'react';
import { ToggleButtonGroup, ToggleButton, Stack } from '@mui/material';
import { ScatterPlot, ShowChart } from '@mui/icons-material';
import { PlotType } from '../../app.types';

export interface ChartTypeButtonsProps {
  plotType: PlotType;
  changePlotType: (plotType: PlotType) => void;
  XAxis?: string;
  changeXAxis: (value?: string) => void;
}

type PlotVariant = 'timeseries' | 'xy';

const ChartTypeButtons = (props: ChartTypeButtonsProps) => {
  const { plotType, changePlotType, XAxis, changeXAxis } = props;

  const handleChangeChartType = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, newChartType: PlotType) => {
      changePlotType(newChartType);
    },
    [changePlotType]
  );

  const [plotVariant, setPlotVariant] = React.useState<PlotVariant>(
    XAxis === 'timestamp' ? 'timeseries' : 'xy'
  );

  const handleChangePlotVariant = React.useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      newPlotVariant: PlotVariant | null
    ) => {
      if (newPlotVariant !== null) {
        setPlotVariant(newPlotVariant);
        switch (newPlotVariant) {
          case 'timeseries':
            changeXAxis('timestamp');
            break;
          case 'xy':
            changeXAxis(undefined);
            changePlotType('scatter');
            break;
          default:
            console.error('Unknown plot variant');
        }
      }
    },
    [changePlotType, changeXAxis]
  );

  return (
    <Stack direction="row" spacing={1}>
      <ToggleButtonGroup
        value={plotVariant}
        exclusive
        onChange={handleChangePlotVariant}
        aria-label="chart type"
      >
        <ToggleButton value="timeseries" sx={{ textTransform: 'none' }}>
          Timeseries
        </ToggleButton>
        <ToggleButton value="xy" sx={{ textTransform: 'none' }}>
          XY
        </ToggleButton>
      </ToggleButtonGroup>
      {XAxis === 'timestamp' && (
        <ToggleButtonGroup
          value={plotType}
          exclusive
          onChange={handleChangeChartType}
          aria-label="timeseries chart type"
        >
          <ToggleButton value="scatter" aria-label="scatter chart">
            <ScatterPlot />
          </ToggleButton>
          <ToggleButton value="line" aria-label="line chart">
            <ShowChart />
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Stack>
  );
};

export default ChartTypeButtons;
