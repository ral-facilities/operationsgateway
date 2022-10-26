import React from 'react';
import PlotSettingsController from './plotSettings/plotSettingsController.component';
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
  XAxisScale,
  YAxesScale,
  PlotType,
  SelectedPlotChannel,
  FullScalarChannelMetadata,
} from '../app.types';
import { usePlotRecords } from '../api/records';
import { useScalarChannels } from '../api/channels';
import PlotWindowPortal from './plotWindowPortal.component';
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
  const [yMinimum, setYMinimum] = React.useState<number | undefined>(
    plotConfig.yMinimum
  );
  const [yMaximum, setYMaximum] = React.useState<number | undefined>(
    plotConfig.yMaximum
  );
  const [XAxisScale, setXAxisScale] = React.useState<XAxisScale>(
    plotConfig.XAxisScale
  );
  const [YAxesScale, setYAxesScale] = React.useState<YAxesScale>(
    plotConfig.YAxesScale
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
  const [screenWidth, setScreenWidth] = React.useState<number>(
    plotConfig.screenWidth
  );
  const [screenHeight, setScreenHeight] = React.useState<number>(
    plotConfig.screenHeight
  );
  const [screenX, setScreenX] = React.useState<number>(plotConfig.screenX);
  const [screenY, setScreenY] = React.useState<number>(plotConfig.screenY);
  const [viewFlag, setViewFlag] = React.useState<boolean>(false);

  const toggleGridVisibility = React.useCallback(() => {
    setGridVisible(!gridVisible);
  }, [gridVisible]);

  const toggleAxesLabelsVisibility = React.useCallback(() => {
    setAxesLabelsVisible(!axesLabelsVisible);
  }, [axesLabelsVisible]);

  const resetView = React.useCallback(() => {
    setViewFlag(!viewFlag);
  }, [viewFlag]);

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

  const handleSavePlot = React.useCallback(() => {
    console.log('saving ' + screenX);
    const configToSave: PlotConfig = {
      // ensures that whenever we save the plot, it won't open up a new window
      // if we always set open to true, a "new" plot config will be saved, with open = true
      // this would open up a new window, which we don't want
      open: plotTitle === plotConfig.title,
      title: plotTitle,
      plotType,
      XAxis,
      XAxisScale,
      xMinimum,
      xMaximum,
      selectedPlotChannels,
      YAxesScale,
      yMinimum,
      yMaximum,
      gridVisible,
      axesLabelsVisible,
      selectedColours,
      remainingColours,
      screenWidth,
      screenHeight,
      screenX,
      screenY,
    } as PlotConfig;
    dispatch(savePlot(configToSave));
  }, [
    XAxis,
    XAxisScale,
    YAxesScale,
    axesLabelsVisible,
    dispatch,
    gridVisible,
    plotConfig.title,
    plotTitle,
    plotType,
    remainingColours,
    screenWidth,
    screenHeight,
    screenX,
    screenY,
    selectedColours,
    selectedPlotChannels,
    xMaximum,
    xMinimum,
    yMaximum,
    yMinimum,
  ]);

  const changeWindowSizeAndPosition = React.useCallback(
    (
      screenWidth: number,
      screenHeight: number,
      screenX: number,
      screenY: number
    ) => {
      setScreenWidth(screenWidth);
      setScreenHeight(screenHeight);
      setScreenX(screenX);
      setScreenY(screenY);
    },
    []
  );

  return (
    <PlotWindowPortal
      title={plotTitle}
      onClose={onClose}
      changeWindowSizeAndPosition={changeWindowSizeAndPosition}
      screenWidth={screenWidth}
      screenHeight={screenHeight}
      screenX={screenX}
      screenY={screenY}
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
                YAxesScale={YAxesScale}
                changeYAxesScale={setYAxesScale}
                selectedPlotChannels={selectedPlotChannels}
                changeSelectedPlotChannels={setSelectedPlotChannels}
                xMinimum={xMinimum}
                xMaximum={xMaximum}
                yMinimum={yMinimum}
                yMaximum={yMaximum}
                changeXMinimum={setXMinimum}
                changeXMaximum={setXMaximum}
                changeYMinimum={setYMinimum}
                changeYMaximum={setYMaximum}
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
            XAxisScale={XAxisScale}
            YAxesScale={YAxesScale}
            canvasRef={canvasRef}
            gridVisible={gridVisible}
            axesLabelsVisible={axesLabelsVisible}
            xMinimum={xMinimum}
            xMaximum={xMaximum}
            yMinimum={yMinimum}
            yMaximum={yMaximum}
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
            aria-label="plot-loading-indicator"
          />
        </Backdrop>
      </Grid>
    </PlotWindowPortal>
  );
};

export default PlotWindow;
