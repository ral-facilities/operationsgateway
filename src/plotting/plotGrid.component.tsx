import React from 'react';
import { Button, Card, CardContent, CardActions, Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  createPlot,
  deletePlot,
  openPlot,
  selectPlots,
  PlotConfig,
} from '../state/slices/plotSlice';

const PlotCard = (props: { plotTitle: string; plotConfig: PlotConfig }) => {
  const dispatch = useAppDispatch();
  const { plotTitle } = props;

  return (
    <Card>
      <CardContent>{plotTitle}</CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => {
            dispatch(openPlot(plotTitle));
          }}
        >
          Edit
        </Button>
        <Button
          size="small"
          onClick={() => {
            dispatch(deletePlot(plotTitle));
          }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

interface PlotGridProps {}

const PlotGrid = (props: PlotGridProps) => {
  const dispatch = useAppDispatch();
  const plots = useAppSelector(selectPlots);

  return (
    <Grid container direction="column" spacing={1} mt={0.5} ml={1}>
      <Grid item>
        <Button
          onClick={() => {
            dispatch(createPlot());
          }}
        >
          Create a plot
        </Button>
      </Grid>
      <Grid container item spacing={4}>
        {Object.entries(plots).map(([plotTitle, plotConfig]) => (
          <Grid item key={plotTitle}>
            <PlotCard plotTitle={plotTitle} plotConfig={plotConfig} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default PlotGrid;
