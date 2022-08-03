import React from 'react';
import {
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
} from '@mui/material';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { PlotType } from '../app.types';

interface PlotSettingsProps {
  changePlotTitle: (title: string) => void;
  plotType: PlotType;
  changePlotType: (plotType: PlotType) => void;
}

const PlotSettings = (props: PlotSettingsProps) => {
  const { changePlotTitle, plotType, changePlotType } = props;
  const [title, setTitle] = React.useState('');
  const deferredTitle = React.useDeferredValue(title);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
  );

  const handleChangeChartType = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, newChartType: PlotType | null) => {
      changePlotType(newChartType ?? 'scatter');
    },
    [changePlotType]
  );

  React.useEffect(() => {
    changePlotTitle(deferredTitle);
  }, [changePlotTitle, deferredTitle]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <TextField
          label="Title"
          variant="outlined"
          size="small"
          value={title}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid container item spacing={1}>
        {/* TODO: what do these control? we need to hook them up */}
        <Grid item xs={6}>
          <TextField label="Hours" variant="outlined" size="small" fullWidth />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Points" variant="outlined" size="small" fullWidth />
        </Grid>
      </Grid>
      <Grid item>
        <ToggleButtonGroup
          value={plotType}
          exclusive
          onChange={handleChangeChartType}
          aria-label="chart type"
        >
          <ToggleButton value="scatter" aria-label="scatter chart">
            <ScatterPlotIcon />
          </ToggleButton>
          <ToggleButton value="line" aria-label="line chart">
            <ShowChartIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
};

export default PlotSettings;
