import React from 'react';
import PlotSettingsController from './plotSettings/plotSettingsController.component';
import Plot from './plot.component';
import { PlotButtons } from '../windows/windowButtons.component';
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
  XAxisScale,
  YAxisScale,
  PlotType,
  SelectedPlotChannel,
  FullScalarChannelMetadata,
  DEFAULT_WINDOW_VARS,
} from '../app.types';
import { usePlotRecords } from '../api/records';
import { useScalarChannels } from '../api/channels';
import WindowPortal, {
  WindowPortal as WindowPortalClass,
} from '../windows/windowPortal.component';
import { selectSelectedChannels } from '../state/slices/tableSlice';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { PlotConfig, savePlot } from '../state/slices/plotSlice';

interface PlotWindowProps {
  onClose: () => void;
  plotConfig: PlotConfig;
}
const drawerWidth = 300;

const PlotWindow = (props: PlotWindowProps) => {
  const { onClose, plotConfig } = props;

  const dispatch = useAppDispatch();

  const [plotTitle, setPlotTitle] = React.useState(plotConfig.title);
  const [plotType, setPlotType] = React.useState<PlotType>(plotConfig.plotType);
  const [xMinimum, setXMinimum] = React.useState<number | undefined>(
    plotConfig.xMinimum
  );
  const [xMaximum, setXMaximum] = React.useState<number | undefined>(
    plotConfig.xMaximum
  );
  const [leftYAxisMinimum, setLeftYAxisMinimum] = React.useState<
    number | undefined
  >(plotConfig.leftYAxisMinimum);
  const [leftYAxisMaximum, setLeftYAxisMaximum] = React.useState<
    number | undefined
  >(plotConfig.leftYAxisMaximum);
  const [rightYAxisMinimum, setRightYAxisMinimum] = React.useState<
    number | undefined
  >(plotConfig.rightYAxisMinimum);
  const [rightYAxisMaximum, setRightYAxisMaximum] = React.useState<
    number | undefined
  >(plotConfig.rightYAxisMaximum);
  const [XAxisScale, setXAxisScale] = React.useState<XAxisScale>(
    plotConfig.XAxisScale
  );
  const [leftYAxisScale, setLeftYAxisScale] = React.useState<YAxisScale>(
    plotConfig.leftYAxisScale
  );
  const [rightYAxisScale, setRightYAxisScale] = React.useState<YAxisScale>(
    plotConfig.rightYAxisScale
  );

  const [XAxis, setXAxis] = React.useState<string | undefined>(
    plotConfig.XAxis
  );
  const [selectedPlotChannels, setSelectedPlotChannels] = React.useState<
    SelectedPlotChannel[]
  >(plotConfig.selectedPlotChannels);
  const [gridVisible, setGridVisible] = React.useState<boolean>(
    plotConfig.gridVisible
  );
  const [axesLabelsVisible, setAxesLabelsVisible] = React.useState<boolean>(
    plotConfig.axesLabelsVisible
  );
  const [selectedColours, setSelectedColours] = React.useState<string[]>(
    plotConfig.selectedColours
  );
  const [remainingColours, setRemainingColours] = React.useState<string[]>(
    plotConfig.remainingColours
  );
  const [viewFlag, setViewFlag] = React.useState<boolean>(false);

  const toggleGridVisibility = React.useCallback(() => {
    setGridVisible((gridVisible) => !gridVisible);
  }, []);

  const toggleAxesLabelsVisibility = React.useCallback(() => {
    setAxesLabelsVisible((axesLabelsVisible) => !axesLabelsVisible);
  }, []);

  const resetView = React.useCallback(() => {
    setViewFlag((viewFlag) => !viewFlag);
  }, []);

  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = React.useCallback(() => {
    setOpen(true);
  }, []);
  const handleDrawerClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const { data: records, isLoading: recordsLoading } = usePlotRecords(
    selectedPlotChannels,
    XAxis
  );
  const { data: channels, isLoading: channelsLoading } = useScalarChannels();

  const selectedScalarRecordTableChannels: FullScalarChannelMetadata[] =
    useAppSelector((state) =>
      selectSelectedChannels(state, channels ?? [])
    ) as FullScalarChannelMetadata[];

  const XAxisDisplayName = channels?.find(
    (channel) => channel.systemName === XAxis
  )?.name;

  const plotWindowRef = React.createRef<WindowPortalClass>();

  const handleSavePlot = React.useCallback(() => {
    // Capture window size and position
    const outerWidth =
      plotWindowRef.current?.state.window?.outerWidth ??
      DEFAULT_WINDOW_VARS.outerWidth;
    const outerHeight =
      plotWindowRef.current?.state.window?.outerHeight ??
      DEFAULT_WINDOW_VARS.outerHeight;
    const screenX =
      plotWindowRef.current?.state.window?.screenX ??
      DEFAULT_WINDOW_VARS.screenX;
    const screenY =
      plotWindowRef.current?.state.window?.screenY ??
      DEFAULT_WINDOW_VARS.screenY;

    const configToSave: PlotConfig = {
      ...plotConfig,
      title: plotTitle,
      plotType,
      XAxis,
      XAxisScale,
      xMinimum,
      xMaximum,
      selectedPlotChannels,
      leftYAxisScale,
      rightYAxisScale,
      leftYAxisMinimum,
      leftYAxisMaximum,
      rightYAxisMinimum,
      rightYAxisMaximum,
      gridVisible,
      axesLabelsVisible,
      selectedColours,
      remainingColours,
      outerWidth,
      outerHeight,
      screenX,
      screenY,
    };
    dispatch(savePlot(configToSave));
  }, [
    plotWindowRef,
    plotTitle,
    plotConfig,
    plotType,
    XAxis,
    XAxisScale,
    xMinimum,
    xMaximum,
    selectedPlotChannels,
    leftYAxisScale,
    rightYAxisScale,
    leftYAxisMinimum,
    leftYAxisMaximum,
    rightYAxisMinimum,
    rightYAxisMaximum,
    gridVisible,
    axesLabelsVisible,
    selectedColours,
    remainingColours,
    dispatch,
  ]);

  return (
    <WindowPortal
      ref={plotWindowRef}
      title={plotTitle}
      onClose={onClose}
      outerWidth={plotConfig.outerWidth}
      outerHeight={plotConfig.outerHeight}
      screenX={plotConfig.screenX}
      screenY={plotConfig.screenY}
    >
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
                  sx={{
                    ...(!open && { visibility: 'hidden' }),
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Box>
              <PlotSettingsController
                selectedRecordTableChannels={selectedScalarRecordTableChannels}
                allChannels={channels ?? []}
                plotTitle={plotTitle}
                changePlotTitle={setPlotTitle}
                plotType={plotType}
                changePlotType={setPlotType}
                XAxis={XAxis}
                changeXAxis={setXAxis}
                XAxisScale={XAxisScale}
                changeXAxisScale={setXAxisScale}
                leftYAxisScale={leftYAxisScale}
                changeLeftYAxisScale={setLeftYAxisScale}
                rightYAxisScale={rightYAxisScale}
                changeRightYAxisScale={setRightYAxisScale}
                selectedPlotChannels={selectedPlotChannels}
                changeSelectedPlotChannels={setSelectedPlotChannels}
                xMinimum={xMinimum}
                xMaximum={xMaximum}
                leftYAxisMinimum={leftYAxisMinimum}
                leftYAxisMaximum={leftYAxisMaximum}
                rightYAxisMinimum={rightYAxisMinimum}
                rightYAxisMaximum={rightYAxisMaximum}
                changeXMinimum={setXMinimum}
                changeXMaximum={setXMaximum}
                changeLeftYAxisMinimum={setLeftYAxisMinimum}
                changeLeftYAxisMaximum={setLeftYAxisMaximum}
                changeRightYAxisMinimum={setRightYAxisMinimum}
                changeRightYAxisMaximum={setRightYAxisMaximum}
                selectedColours={selectedColours}
                remainingColours={remainingColours}
                changeSelectedColours={setSelectedColours}
                changeRemainingColours={setRemainingColours}
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
                aria-label="Settings loading"
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
                canvasRef={canvasRef}
                title={plotTitle}
                XAxis={XAxis}
                gridVisible={gridVisible}
                axesLabelsVisible={axesLabelsVisible}
                toggleGridVisibility={toggleGridVisibility}
                toggleAxesLabelsVisibility={toggleAxesLabelsVisibility}
                resetView={resetView}
                savePlot={handleSavePlot}
              />
            </Grid>
          </Grid>
          <Plot
            datasets={records ?? []}
            selectedPlotChannels={selectedPlotChannels}
            title={plotTitle}
            type={plotType}
            XAxis={XAxis}
            XAxisDisplayName={XAxisDisplayName}
            XAxisScale={XAxisScale}
            leftYAxisScale={leftYAxisScale}
            rightYAxisScale={rightYAxisScale}
            canvasRef={canvasRef}
            gridVisible={gridVisible}
            axesLabelsVisible={axesLabelsVisible}
            xMinimum={xMinimum}
            xMaximum={xMaximum}
            leftYAxisMinimum={leftYAxisMinimum}
            leftYAxisMaximum={leftYAxisMaximum}
            rightYAxisMinimum={rightYAxisMinimum}
            rightYAxisMaximum={rightYAxisMaximum}
            viewReset={viewFlag}
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
            aria-label="Plot loading"
          />
        </Backdrop>
      </Grid>
    </WindowPortal>
  );
};

export default PlotWindow;
