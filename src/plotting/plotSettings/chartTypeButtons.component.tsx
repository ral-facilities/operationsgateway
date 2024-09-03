import { ScatterPlot, ShowChart } from '@mui/icons-material';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';
import { PlotType, timeChannelName } from '../../app.types';

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
    (_event: React.MouseEvent<HTMLElement>, newChartType: PlotType) => {
      changePlotType(newChartType);
    },
    [changePlotType]
  );

  const handleChangePlotVariant = React.useCallback(
    (
      _event: React.MouseEvent<HTMLElement>,
      newPlotVariant: PlotVariant | null
    ) => {
      if (newPlotVariant !== null) {
        switch (newPlotVariant) {
          case 'timeseries':
            changeXAxis(timeChannelName);
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
        value={XAxis === timeChannelName ? 'timeseries' : 'xy'}
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
      {XAxis === timeChannelName && (
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
