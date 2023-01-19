import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
} from '@mui/material';

interface ChannelsDialogueProps {
  open: boolean;
  onClose: () => void;
}

const ChannelsDialogue = (props: ChannelsDialogueProps) => {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Grid container columnSpacing={2}>
          <Grid item xs>
            Data Channels
          </Grid>
          <Grid item xs>
            <TextField label="Search data channels" fullWidth></TextField>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid item xs>
            Tree view
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs>
            Help / info
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={() => {
            return;
          }}
        >
          Add Channels
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChannelsDialogue;
