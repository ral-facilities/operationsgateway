import { ScatterPlot, ShowChart } from '@mui/icons-material';
import { Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
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
        size="small"
      >
        <ToggleButton
          value="timeseries"
          sx={{ textTransform: 'none', padding: '5px 6px' }}
        >
          Timeseries
        </ToggleButton>
        <ToggleButton
          value="xy"
          sx={{ textTransform: 'none', padding: '5px 6px' }}
        >
          XY
        </ToggleButton>
      </ToggleButtonGroup>
      {XAxis === timeChannelName && (
        <ToggleButtonGroup
          value={plotType}
          exclusive
          onChange={handleChangeChartType}
          aria-label="timeseries chart type"
          size="small"
        >
          <Tooltip
            title="Scatter Chart"
            arrow
            enterDelay={300}
            enterNextDelay={300}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -8],
                    },
                  },
                ],
              },
            }}
          >
            <ToggleButton value="scatter" sx={{ padding: 0.5 }}>
              <ScatterPlot />
            </ToggleButton>
          </Tooltip>
          <Tooltip
            title="Line Chart"
            arrow
            enterDelay={300}
            enterNextDelay={300}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -8],
                    },
                  },
                ],
              },
            }}
          >
            <ToggleButton value="line" sx={{ padding: 0.5 }}>
              <ShowChart />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      )}
    </Stack>
  );
};

export default ChartTypeButtons;
