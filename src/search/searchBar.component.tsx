import React from 'react';
import DateTime from './components/dateTime.component';
import Timeframe from './components/timeframe.component';
import Experiment from './components/experiment.component';
import ShotNumber from './components/shotNumber.component';
import { Grid, Button } from '@mui/material';

const SearchBar = (): React.ReactElement => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <DateTime />
      </Grid>
      <Grid item xs={2}>
        <Timeframe />
      </Grid>
      <Grid item xs={2}>
        <Experiment />
      </Grid>
      <Grid item xs={2}>
        <ShotNumber />
      </Grid>
      <Grid item xs={1}>
        <Button variant="outlined" sx={{ height: '100%' }}>
          Search
        </Button>
      </Grid>
    </Grid>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
