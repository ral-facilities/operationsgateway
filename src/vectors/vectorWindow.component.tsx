import { Backdrop, CircularProgress, Grid } from '@mui/material';
import React from 'react';
import { useVector } from '../api/vectors';
import type { Vector } from '../app.types';
import { useAppDispatch } from '../state/hooks';
import { WindowConfigType, updateWindow } from '../state/slices/windowSlice';
import ThumbnailSelector, {
  thumbnailSelectorWidth,
} from '../windows/thumbnailSelector.component';
import { VectorButtons } from '../windows/windowButtons.component';
import WindowPortal from '../windows/windowPortal.component';
import VectorControlPanel from './vectorControlsPanel.component';
import VectorPlot from './vectorPlot.component';

interface VectorWindowProps {
  onClose: () => void;
  vectorConfig: WindowConfigType;
  vectorWindowRef: React.RefObject<WindowPortal>;
}

const VectorWindow = (props: VectorWindowProps) => {
  const { onClose, vectorConfig, vectorWindowRef } = props;
  const { channelName, recordId, title } = vectorConfig;

  const { data: vector, isLoading: vectorLoading } = useVector(
    recordId,
    channelName
  );

  const isVector = vectorConfig.type === 'vector';
  const labels = isVector ? vectorConfig.labels : undefined;
  const units = isVector ? vectorConfig.units : undefined;

  const dispatch = useAppDispatch();

  const [viewFlag, setViewFlag] = React.useState<boolean>(false);
  const [showControls, setShowControls] = React.useState<boolean>(false);

  const [range, setRange] = React.useState<{ skip: number; limit: number }>({
    skip: 0,
    limit: vector?.data.length || 0,
  });

  const slicedVector: Vector = {
    data: (vector || { data: [] }).data.slice(range.skip, range.limit),
  };
  const slicedLabels: string[] = (
    labels ||
    Array.from({ length: vector?.data.length || 0 }, (_, i) => i.toString())
  ).slice(range.skip, range.limit);
  const resetView = React.useCallback(() => {
    setViewFlag((viewFlag) => !viewFlag);
  }, []);

  React.useEffect(() => {
    if (labels) {
      setRange((prev) => ({ ...prev, limit: labels.length }));
    }
  }, [labels]);

  const chartRef = React.useRef<HTMLDivElement | null>(null);

  const updateVectorConfig = React.useCallback(
    (newRecordId?: string) => {
      const configToSave: WindowConfigType = {
        // ensures that whenever we save the plot, it won't open up a new window
        // if we always set open to true, a "new" plot config will be saved, with open = true
        // this would open up a new window, which we don't want

        ...vectorConfig,
        ...(newRecordId
          ? {
              recordId: newRecordId,
              title: `Vector ${vectorConfig.channelName} ${newRecordId}`,
            }
          : {}),
      };
      dispatch(updateWindow(configToSave));
    },
    [vectorConfig, dispatch]
  );

  const onChangeShowControls = React.useCallback(
    (show: boolean) => {
      const plotWindow = vectorWindowRef?.current?.getWindow();
      if (plotWindow) {
        setShowControls(show);
        if (chartRef.current) {
          plotWindow.Plotly?.Plots?.resize(chartRef.current);
        }
      }
    },
    [vectorWindowRef]
  );

  return (
    <WindowPortal
      ref={vectorWindowRef}
      title={title}
      onClose={onClose}
      innerWidth={vectorConfig.innerWidth}
      innerHeight={vectorConfig.innerHeight}
      screenX={vectorConfig.screenX}
      screenY={vectorConfig.screenY}
    >
      <Grid
        container
        direction="row"
        id="vector-window"
        sx={(theme) => ({
          position: 'relative',
          height: '100%',
          backgroundColor: theme.palette.background.default,
        })}
        spacing={0}
      >
        <Grid container item xs="auto">
          <ThumbnailSelector
            channelName={channelName}
            recordId={recordId}
            changeWindowConfig={updateVectorConfig}
          />
        </Grid>
        <Grid
          container
          item
          direction="column"
          wrap="nowrap"
          xs
          sx={{
            width: `calc(100% - ${thumbnailSelectorWidth}px)`,
            position: 'relative',
            height: '100%',
          }}
        >
          <Grid
            container
            item
            justifyContent="flex-end"
            wrap="nowrap"
            mt={1}
            mr={1}
            ml={1}
            xs="auto"
          >
            <VectorButtons
              data={vector}
              labels={labels}
              units={units}
              chartRef={chartRef}
              windowRef={vectorWindowRef}
              title={title}
              resetView={resetView}
              showControls={showControls}
              onChangeShowControls={onChangeShowControls}
            />
          </Grid>
          <Grid
            item
            sx={{
              height: 'calc(100% - 60px)',
            }}
          >
            <Grid
              container
              sx={{
                height: '100%',
              }}
              wrap="nowrap"
              spacing={1}
            >
              <Grid
                item
                m={1}
                xs
                sx={{
                  height: '100%',
                }}
              >
                <VectorPlot
                  vector={slicedVector}
                  labels={slicedLabels}
                  units={units}
                  chartRef={chartRef}
                  viewReset={viewFlag}
                  title={title}
                />
              </Grid>
              <Grid
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
                item
                margin={1}
              >
                {showControls && (
                  <VectorControlPanel
                    vector={vector}
                    range={range}
                    onChangeRange={setRange}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <Backdrop
          component="div"
          sx={{ position: 'absolute', zIndex: 100, height: 'inherit' }}
          open={vectorLoading}
          role="none"
          aria-hidden={false}
        >
          <CircularProgress
            id="vector-loading-indicator"
            aria-label="Vector loading"
          />
        </Backdrop>
      </Grid>
    </WindowPortal>
  );
};

export default VectorWindow;
