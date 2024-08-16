import { Backdrop, CircularProgress, Grid } from '@mui/material';
import React from 'react';
import { useWaveform } from '../api/waveforms';
import { useAppDispatch } from '../state/hooks';
import { TraceOrImageWindow, updateWindow } from '../state/slices/windowSlice';
import ThumbnailSelector from '../windows/thumbnailSelector.component';
import { TraceButtons } from '../windows/windowButtons.component';
import WindowPortal, {
  WindowPortal as WindowPortalClass,
} from '../windows/windowPortal.component';
import TracePlot from './tracePlot.component';

interface TraceWindowProps {
  onClose: () => void;
  traceConfig: TraceOrImageWindow;
  traceWindowRef: React.RefObject<WindowPortalClass>;
}

const TraceWindow = (props: TraceWindowProps) => {
  const { onClose, traceConfig, traceWindowRef } = props;
  const { channelName, recordId, title } = traceConfig;

  const dispatch = useAppDispatch();

  const [viewFlag, setViewFlag] = React.useState<boolean>(false);

  const [pointsVisible, setPointsVisible] = React.useState<boolean>(false);

  const resetView = React.useCallback(() => {
    setViewFlag((viewFlag) => !viewFlag);
  }, []);

  const togglePointsVisibility = React.useCallback(() => {
    setPointsVisible((pointsVisible) => !pointsVisible);
  }, []);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const { data: waveform, isLoading: waveformLoading } = useWaveform(
    recordId,
    channelName
  );

  const updateTraceConfig = React.useCallback(
    (newRecordId?: string) => {
      const configToSave: TraceOrImageWindow = {
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
      >
        <Grid
          container
          item
          direction="column"
          wrap="nowrap"
          sx={{ width: '100%', position: 'relative', height: '100%' }}
        >
          <Grid
            container
            item
            justifyContent="flex-end"
            wrap="nowrap"
            mt={1}
            ml={-1}
          >
            <TraceButtons
              data={waveform}
              canvasRef={canvasRef}
              title={title}
              resetView={resetView}
              pointsVisible={pointsVisible}
              togglePointsVisibility={togglePointsVisibility}
            />
          </Grid>
          <Grid container item wrap="nowrap" flexGrow={1}>
            <ThumbnailSelector
              channelName={channelName}
              recordId={recordId}
              changeRecordId={updateTraceConfig}
            />
            <TracePlot
              trace={waveform ?? { _id: '0', x: [], y: [] }}
              canvasRef={canvasRef}
              viewReset={viewFlag}
              title={title}
              pointsVisible={pointsVisible}
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
