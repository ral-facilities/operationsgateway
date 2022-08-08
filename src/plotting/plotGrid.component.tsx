import React from 'react';
import { Button, Grid } from '@mui/material';
import PlotWindow from './plotWindow.component';

interface PlotGridProps {}

let untitledNum = 1;

const PlotGrid = (props: PlotGridProps) => {
  // TODO: make these a list of plot configs which control which plot is opened
  const [openPlots, setOpenPlots] = React.useState<string[]>([]);
  return (
    <Grid container>
      <Button
        onClick={() => {
          setOpenPlots([...openPlots, `Untitled ${untitledNum}`]);
          untitledNum += 1;
        }}
      >
        Create a plot
      </Button>
      <Grid container item>
        {openPlots.map((item) => {
          return (
            <PlotWindow
              key={item}
              untitledTitle={item}
              onClose={() => {
                setOpenPlots(openPlots.filter((i) => item !== i));
              }}
            />
          );
        })}
      </Grid>
    </Grid>
  );
};

export default PlotGrid;
