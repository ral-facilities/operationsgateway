import React from 'react';
import PlotSettings from './plotSettings.component';
import Plot from './plot.component';
import { Box, Grid, Drawer, IconButton, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { AxisSettings, PlotType } from '../app.types';
import PlotWindowPortal from './plotWindowPortal.component';

interface PlotWindowProps {
  onClose: () => void;
  untitledTitle: string;
}
const drawerWidth = 300;

const PlotWindow = (props: PlotWindowProps) => {
  const { onClose, untitledTitle } = props;
  const [plotTitle, setPlotTitle] = React.useState('');
  const [plotType, setPlotType] = React.useState<PlotType>('scatter');
  const [XAxisSettings, setXAxisSettings] = React.useState<AxisSettings>({
    scale: 'time',
  });
  const [YAxesSettings, setYAxesSettings] = React.useState<AxisSettings>({
    scale: 'linear',
  });

  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = React.useCallback(() => {
    setOpen(true);
    window.dispatchEvent(
      new Event(`resize OperationsGateway Plot - ${plotTitle || untitledTitle}`)
    );
  }, [plotTitle, untitledTitle]);
  const handleDrawerClose = React.useCallback(() => {
    setOpen(false);
    window.dispatchEvent(
      new Event(`resize OperationsGateway Plot - ${plotTitle || untitledTitle}`)
    );
  }, [plotTitle, untitledTitle]);

  return (
    <PlotWindowPortal title={plotTitle || untitledTitle} onClose={onClose}>
      <Grid
        container
        direction="row"
        id="plotting-window"
        sx={(theme) => ({
          position: 'relative',
          height: '100%',
          backgroundColor: theme.palette.background.default,
        })}
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
                  position: 'relative',
                }
              : { width: '100%', position: 'relative' }
          }
        >
          <IconButton
            color="inherit"
            aria-label="open settings"
            onClick={handleDrawerOpen}
            sx={{
              position: 'absolute',
              zIndex: 1,
              ...(open && { display: 'none' }),
            }}
          >
            <SettingsIcon />
          </IconButton>
          <Plot
            title={plotTitle || untitledTitle}
            type={plotType}
            XAxisSettings={XAxisSettings}
            YAxesSettings={YAxesSettings}
          />
        </Grid>
      </Grid>
    </PlotWindowPortal>
  );
};

export default PlotWindow;
