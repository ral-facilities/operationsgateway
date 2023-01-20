import React from 'react';
import {
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { NavigateNext, Search } from '@mui/icons-material';

interface ChannelsDialogueProps {
  open: boolean;
  onClose: () => void;
}

const ChannelsDialogue = (props: ChannelsDialogueProps) => {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle component="div">
        <Grid container columnSpacing={2}>
          <Grid item xs>
            <Typography variant="h6" component="h2">
              Data Channels
            </Typography>
          </Grid>
          <Grid item xs>
            <TextField
              size="small"
              label="Search data channels"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            ></TextField>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent
        sx={{
          border: 'thin lightgrey',
          borderStyle: 'solid none',
          paddingTop: '8px !important',
          paddingBottom: '8px',
        }}
      >
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            key="1"
            color="inherit"
            component="span"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              return;
            }}
          >
            MUI
          </Link>
          <Link
            underline="hover"
            key="2"
            color="inherit"
            component="span"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              return;
            }}
          >
            Core
          </Link>
          <Typography key="3" color="text.primary">
            Breadcrumb
          </Typography>
        </Breadcrumbs>
      </DialogContent>
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
