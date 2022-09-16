import React from 'react';
import PlotSettings from './plotSettings.component';
import Plot from './plot.component';
import PlotButtons from './plotButtons.component';
import {
  Box,
  Grid,
  Drawer,
  IconButton,
  Typography,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  XAxisSettings,
  YAxisSettings,
  PlotType,
  SelectedPlotChannel,
} from '../app.types';
import { usePlotRecords } from '../api/records';
import { useScalarChannels } from '../api/channels';
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
  const [XAxisSettings, setXAxisSettings] = React.useState<XAxisSettings>({
    scale: 'linear',
  });
  const [YAxesSettings, setYAxesSettings] = React.useState<YAxisSettings>({
    scale: 'linear',
  });
  const [XAxis, setXAxis] = React.useState<string>('');
  const [selectedChannels, setSelectedChannels] = React.useState<
    SelectedPlotChannel[]
  >([]);

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

  const svgRef = React.useRef<HTMLElement | null>(null);

  const { data: records, isLoading: recordsLoading } = usePlotRecords(
    XAxis,
    selectedChannels
  );
  const { data: channels, isLoading: channelsLoading } = useScalarChannels();

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
                channels={channels ?? []}
                changePlotTitle={setPlotTitle}
                plotType={plotType}
                changePlotType={setPlotType}
                XAxis={XAxis}
                changeXAxis={setXAxis}
                XAxisSettings={XAxisSettings}
                changeXAxisSettings={setXAxisSettings}
                YAxesSettings={YAxesSettings}
                changeYAxesSettings={setYAxesSettings}
                selectedChannels={selectedChannels}
                changeSelectedChannels={setSelectedChannels}
              />
            </Box>
            {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
            <Backdrop
              component="div"
              sx={{ position: 'absolute', zIndex: 100, height: 'inherit' }}
              open={recordsLoading || channelsLoading}
              role="none"
              aria-hidden={false}
            >
              <CircularProgress
                id="settings-loading-indicator"
                aria-label="settings-loading-indicator"
              />
            </Backdrop>
          </Drawer>
        </Grid>

        <Grid
          container
          item
          direction="column"
          wrap="nowrap"
          sx={
            open
              ? {
                  marginLeft: `${drawerWidth}px`,
                  width: `calc(100% - ${drawerWidth}px)`,
                  position: 'relative',
                  height: '100%',
                }
              : { width: '100%', position: 'relative', height: '100%' }
          }
        >
          <Grid container item justifyContent="space-between" wrap="nowrap">
            <IconButton
              color="inherit"
              aria-label="open settings"
              onClick={handleDrawerOpen}
              sx={{
                ...(open && { visibility: 'hidden' }),
              }}
            >
              <SettingsIcon />
            </IconButton>
            <Grid item mr={1} mt={1}>
              <PlotButtons
                data={records}
                svgRef={svgRef}
                title={plotTitle || untitledTitle}
                XAxis={XAxis}
              />
            </Grid>
          </Grid>
          <Plot
            datasets={records}
            title={plotTitle || untitledTitle}
            type={plotType}
            XAxis={XAxis}
            XAxisSettings={XAxisSettings}
            YAxesSettings={YAxesSettings}
            svgRef={svgRef}
          />
        </Grid>
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <Backdrop
          component="div"
          sx={{ position: 'absolute', zIndex: 100, height: 'inherit' }}
          open={recordsLoading || channelsLoading}
          role="none"
          aria-hidden={false}
        >
          <CircularProgress
            id="plot-loading-indicator"
            aria-label="plot-loading-indicator"
          />
        </Backdrop>
      </Grid>
    </PlotWindowPortal>
  );
};

export default PlotWindow;
