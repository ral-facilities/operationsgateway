import React from 'react';
import PlotSettings from './plotSettings.component';
import Plot from './plot.component';
import { Box, Grid, Drawer, IconButton, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { AxisSettings, PlotType } from '../app.types';

interface PlotWindowProps {}

const drawerWidth = 300;

const PlotWindow = (props: PlotWindowProps) => {
  const [plotTitle, setPlotTitle] = React.useState('');
  const [plotType, setPlotType] = React.useState<PlotType>('scatter');
  const [XAxisSettings, setXAxisSettings] = React.useState<AxisSettings>({
    scale: 'time',
  });
  const [YAxesSettings, setYAxesSettings] = React.useState<AxisSettings>({
    scale: 'linear',
  });
  const [XAxis, setXAxis] = React.useState<string>('');
  const [YAxis, setYAxis] = React.useState<string>('');

  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = React.useCallback(() => {
    setOpen(true);
  }, [setOpen]);
  const handleDrawerClose = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Grid
      container
      direction="row"
      id="plotting-window"
      sx={{
        position: 'relative',
      }}
      spacing={0}
    >
      <Grid item>
        <Drawer
          PaperProps={{
            sx: {
              position: 'absolute',
              width: drawerWidth,
            },
          }}
          BackdropProps={{ sx: { position: 'absolute' } }}
          ModalProps={{
            container: document.getElementById('drawer-container'),
            sx: { position: 'absolute' },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Box mr={1} ml={1}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Config</Typography>
              <IconButton
                onClick={handleDrawerClose}
                aria-label="close settings"
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
            <PlotSettings
              changePlotTitle={setPlotTitle}
              plotType={plotType}
              changePlotType={setPlotType}
              XAxis={XAxis}
              YAxis={YAxis}
              changeXAxis={setXAxis}
              changeYAxis={setYAxis}
              XAxisSettings={XAxisSettings}
              changeXAxisSettings={setXAxisSettings}
              YAxesSettings={YAxesSettings}
              changeYAxesSettings={setYAxesSettings}
            />
          </Box>
        </Drawer>
      </Grid>

      <Grid
        item
        sx={
          open
            ? {
                marginLeft: `${drawerWidth}px`,
                width: `calc(100% - ${drawerWidth}px)`,
              }
            : { width: '100%' }
        }
      >
        <IconButton
          color="inherit"
          aria-label="open settings"
          onClick={handleDrawerOpen}
          sx={{ position: 'absolute', ...(open && { display: 'none' }) }}
        >
          <SettingsIcon />
        </IconButton>
        <Plot
          title={plotTitle}
          type={plotType}
          XAxis={XAxis}
          YAxis={YAxis}
          XAxisSettings={XAxisSettings}
          YAxesSettings={YAxesSettings}
        />
      </Grid>
    </Grid>
  );
};

export default PlotWindow;
