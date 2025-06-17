import { Backdrop, CircularProgress, Grid2 as Grid } from '@mui/material';
import React from 'react';
import { useWaveform } from '../api/waveforms';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectPlotAxisSigFigs } from '../state/slices/configSlice';
import { WindowConfigType, updateWindow } from '../state/slices/windowSlice';
import ThumbnailSelector, {
  thumbnailSelectorWidth,
} from '../windows/thumbnailSelector.component';
import { TraceButtons } from '../windows/windowButtons.component';
import WindowPortal from '../windows/windowPortal.component';
import TracePlot from './tracePlot.component';

interface TraceWindowProps {
  onClose: () => void;
  traceConfig: WindowConfigType;
  traceWindowRef: React.RefObject<WindowPortal>;
}

const TraceWindow = (props: TraceWindowProps) => {
  const { onClose, traceConfig, traceWindowRef } = props;
  const { channelName, recordId, title } = traceConfig;

  const xUnits = traceConfig.type === 'trace' ? traceConfig.xUnits : undefined;
  const yUnits = traceConfig.type === 'trace' ? traceConfig.yUnits : undefined;

  const dispatch = useAppDispatch();

  const [viewFlag, setViewFlag] = React.useState<boolean>(false);

  const [pointsVisible, setPointsVisible] = React.useState<boolean>(false);

  const resetView = React.useCallback(() => {
    setViewFlag((viewFlag) => !viewFlag);
  }, []);

  const togglePointsVisibility = React.useCallback(() => {
    setPointsVisible((pointsVisible) => !pointsVisible);
  }, []);

  const plotAxisSigFigs = useAppSelector(selectPlotAxisSigFigs);
  const chartRef = React.useRef<HTMLDivElement | null>(null);

  const { data: waveform, isLoading: waveformLoading } = useWaveform(
    recordId,
    channelName
  );

  const updateTraceConfig = React.useCallback(
    (newRecordId?: string) => {
      const configToSave: WindowConfigType = {
        // ensures that whenever we save the plot, it won't open up a new window
        // if we always set open to true, a "new" plot config will be saved, with open = true
        // this would open up a new window, which we don't want
        ...traceConfig,
        ...(newRecordId
          ? {
              recordId: newRecordId,
              title: `Trace ${traceConfig.channelName} ${newRecordId}`,
            }
          : {}),
      };
      dispatch(updateWindow(configToSave));
    },
    [traceConfig, dispatch]
  );

  return (
    <WindowPortal
      ref={traceWindowRef}
      title={title}
      onClose={onClose}
      innerWidth={traceConfig.innerWidth}
      innerHeight={traceConfig.innerHeight}
      screenX={traceConfig.screenX}
      screenY={traceConfig.screenY}
    >
      <Grid
        container
        direction="row"
        id="trace-window"
        sx={(theme) => ({
          position: 'relative',
          height: '100%',
          backgroundColor: theme.palette.background.default,
        })}
        spacing={0}
        width="100%"
      >
        <Grid container size="auto">
          <ThumbnailSelector
            channelName={channelName}
            recordId={recordId}
            changeWindowConfig={updateTraceConfig}
          />
        </Grid>
        <Grid
          container
          direction="column"
          wrap="nowrap"
          size="grow"
          sx={{
            width: `calc(100% - ${thumbnailSelectorWidth}px)`,
            position: 'relative',
            height: '100%',
          }}
        >
          <Grid
            container
            justifyContent="flex-end"
            wrap="nowrap"
            mt={1}
            mr={1}
            ml={1}
            size="auto"
          >
            <TraceButtons
              data={waveform}
              chartRef={chartRef}
              windowRef={traceWindowRef}
              title={title}
              resetView={resetView}
              pointsVisible={pointsVisible}
              togglePointsVisibility={togglePointsVisibility}
              xUnits={xUnits}
              yUnits={yUnits}
            />
          </Grid>
          <Grid
            m={1}
            size="grow"
            sx={{
              height: 'calc(100% - 60px)',
            }}
          >
            <TracePlot
              trace={waveform ?? { _id: '0', x: [], y: [] }}
              chartRef={chartRef}
              viewReset={viewFlag}
              title={title}
              pointsVisible={pointsVisible}
              xUnits={xUnits}
              yUnits={yUnits}
              plotAxisSigFigs={plotAxisSigFigs}
            />
          </Grid>
        </Grid>

        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <Backdrop
          component="div"
          sx={{ position: 'absolute', zIndex: 100, height: 'inherit' }}
          open={waveformLoading}
          role="none"
          aria-hidden={false}
        >
          <CircularProgress
            id="trace-loading-indicator"
            aria-label="Trace loading"
          />
        </Backdrop>
      </Grid>
    </WindowPortal>
  );
};

export default TraceWindow;
