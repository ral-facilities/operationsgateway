import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  styled,
  Typography,
} from '@mui/material';
import React from 'react';
import FilterInput from './filterInput.component';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FilterDialogueProps {
  open: boolean;
  onClose: () => void;
}

const Heading = (props: React.ComponentProps<typeof Typography>) => (
  <Typography
    variant="body1"
    component="h3"
    gutterBottom
    sx={{ fontWeight: 'bold' }}
  >
    {props.children}
  </Typography>
);
const Body = (props: React.ComponentProps<typeof Typography>) => (
  <Typography variant="body2" gutterBottom>
    {props.children}
  </Typography>
);

const FilterDialogue = (props: FilterDialogueProps) => {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid item xs pr={1}>
            <Heading>Enter filter</Heading>
            <Grid container item>
              <FilterInput channels={['time', 'shotNum']} />
            </Grid>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs>
            <Heading>Filter help</Heading>
            <Body>
              In the box, start typing data channel names, numbers, mathematical
              symbols such as {'>'} and {'<='} and keywords such as AND and OR.
              The Wizard will suggest suitable options and indicate using a grey
              box when each item has been recognised.
            </Body>
            <Heading>Operators included</Heading>
            <Body>{'>, <, =, !=, and, or, not'}</Body>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => undefined}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialogue;
