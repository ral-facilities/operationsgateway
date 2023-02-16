import React from 'react';
import PlotWindowPortal from './plotWindowPortal.component';
import { useWaveform } from '../api/waveforms';
import { TraceOrImageWindow } from '../state/slices/windowSlice';
import { Grid, Backdrop, CircularProgress } from '@mui/material';
import TracePlot from './tracePlot.component';
import { TraceButtons } from './plotButtons.component';

interface TraceWindowProps {
  onClose: () => void;
  traceConfig: TraceOrImageWindow;
}

const TraceWindow = (props: TraceWindowProps) => {
  const { onClose, traceConfig } = props;
  const { channelName, recordId, title } = traceConfig;

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

  const plotWindowRef = React.createRef<PlotWindowPortal>();

  return (
    <PlotWindowPortal
      ref={plotWindowRef}
      title={title}
      onClose={onClose}
      outerWidth={traceConfig.outerWidth}
      outerHeight={traceConfig.outerHeight}
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
          <TracePlot
            trace={waveform ?? { _id: '0', x: [], y: [] }}
            canvasRef={canvasRef}
            viewReset={viewFlag}
            title={title}
            pointsVisible={pointsVisible}
          />
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
    </PlotWindowPortal>
  );
};

export default TraceWindow;
