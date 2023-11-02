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

const PlotCard = (props: { plotConfig: PlotConfig }) => {
  const dispatch = useAppDispatch();
  const { plotConfig } = props;

  return (
    <Card>
      <CardContent>{plotConfig.title}</CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => {
            dispatch(openPlot(plotConfig.id));
          }}
        >
          Edit
        </Button>
        <Button
          size="small"
          onClick={() => {
            dispatch(deletePlot(plotConfig.id));
          }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PlotListProps {}

const PlotList = (props: PlotListProps) => {
  const dispatch = useAppDispatch();
  const plots = useAppSelector(selectPlots);

  return (
    <Grid
      container
      direction="column"
      spacing={1}
      paddingTop={0.5}
      paddingLeft={1}
      paddingBottom={1}
    >
      <Grid item>
        <Button
          onClick={() => {
            dispatch(createPlot());
          }}
        >
          Create a plot
        </Button>
      </Grid>
      {Object.keys(plots).length > 0 && (
        <Grid container item spacing={4}>
          {Object.entries(plots).map(([plotId, plotConfig]) => (
            <Grid item key={plotId}>
              <PlotCard plotConfig={plotConfig} />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default PlotList;
