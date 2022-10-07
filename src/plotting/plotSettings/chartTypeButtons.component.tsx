import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ScatterPlot, ShowChart } from '@mui/icons-material';
import { PlotType } from '../../app.types';

export interface ChartTypeButtonsProps {
  plotType: PlotType;
  changePlotType: (plotType: PlotType) => void;
}

const ChartTypeButtons = (props: ChartTypeButtonsProps) => {
  const { plotType, changePlotType } = props;

  const handleChangeChartType = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, newChartType: PlotType) => {
      changePlotType(newChartType);
    },
    [changePlotType]
  );

  return (
    <ToggleButtonGroup
      value={plotType}
      exclusive
      onChange={handleChangeChartType}
      aria-label="chart type"
    >
      <ToggleButton value="scatter" aria-label="scatter chart">
        <ScatterPlot />
      </ToggleButton>
      <ToggleButton value="line" aria-label="line chart">
        <ShowChart />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ChartTypeButtons;
