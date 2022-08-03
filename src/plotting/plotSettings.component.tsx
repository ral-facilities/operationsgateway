import React from 'react';
import { Grid, TextField } from '@mui/material';

interface PlotSettingsProps {
  changePlotTitle: (title: string) => void;
}

const PlotSettings = (props: PlotSettingsProps) => {
  const { changePlotTitle } = props;
  const [title, setTitle] = React.useState('');
  const deferredTitle = React.useDeferredValue(title);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
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
    </Grid>
  );
};

export default PlotSettings;
