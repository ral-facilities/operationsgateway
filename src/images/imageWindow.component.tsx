import { Backdrop, CircularProgress, Grid } from '@mui/material';
import React from 'react';
import { useFloatImage, useImage, useImageCrosshair } from '../api/images';
import { useAppDispatch } from '../state/hooks';
import { WindowConfigType, updateWindow } from '../state/slices/windowSlice';
import ThumbnailSelector from '../windows/thumbnailSelector.component';
import { ImageButtons } from '../windows/windowButtons.component';
import WindowPortal from '../windows/windowPortal.component';
import ImageControlsPanel, {
  calculateUpperRangeFromBitDepth,
} from './imageControlsPanel.component';
import { XImagePlot, YImagePlot } from './imagePlot.component';
import ImageView from './imageView.component';

interface ImageWindowProps {
  onClose: () => void;
  imageConfig: WindowConfigType;
  imageWindowRef: React.RefObject<WindowPortal>;
}

const ImageWindow = (props: ImageWindowProps) => {
  const { onClose, imageConfig, imageWindowRef } = props;
  const { channelName, recordId, title } = imageConfig;

  // Type guard to check if imageConfig is of type 'image'
  const bitDepth =
    imageConfig.type === 'image' ? imageConfig.bitDepth : undefined;

  const dispatch = useAppDispatch();

  const [colourMap, setColourMap] = React.useState<string | undefined>(
    undefined
  );
  const [lowerLevel, setLowerLevel] = React.useState<number | undefined>(0);
  const [upperLevel, setUpperLevel] = React.useState<number | undefined>(
    calculateUpperRangeFromBitDepth(bitDepth)
  );
  const [crosshairsMode, setCrosshairsMode] = React.useState(false);
  const [crosshair, setCrosshair] = React.useState<
    { x: number; y: number } | undefined
  >(undefined);

  const { data: imageData, isLoading: imageLoadingStatus } = useImage(
    recordId,
    channelName,
    imageConfig.type === 'image',
    {
      colourMap: colourMap,
      lowerLevel: lowerLevel,
      upperLevel: upperLevel,
    },
    bitDepth
  );

  const { data: floatImageData, isLoading: floatImageLoadingStatus } =
    useFloatImage(
      recordId,
      channelName,
      colourMap,
      imageConfig.type === 'float_image'
    );

  // Set the values accordingly
  const image = imageConfig.type === 'image' ? imageData : floatImageData;
  const imageLoading =
    imageConfig.type === 'image' ? imageLoadingStatus : floatImageLoadingStatus;

  const { data: crosshairData } = useImageCrosshair(
    recordId,
    channelName,
    crosshair,
    crosshairsMode && imageConfig.type === 'image'
  );

  React.useEffect(() => {
    if (crosshairsMode && crosshairData && typeof crosshair === 'undefined') {
      setCrosshair({
        x: crosshairData.column.position,
        y: crosshairData.row.position,
      });
    } else if (!crosshairsMode) {
      // reset when we switch out of the mode
      setCrosshair(undefined);
    }
  }, [crosshair, crosshairData, crosshairsMode]);

  const [viewFlag, setViewFlag] = React.useState<boolean>(false);

  const resetView = React.useCallback(() => {
    setViewFlag((viewFlag) => !viewFlag);
    // reset back to centroid
    setCrosshair(undefined);
  }, []);

  const updateImageConfig = React.useCallback(
    (newRecordId?: string, newBitDepth?: number) => {
      const configToSave: WindowConfigType = {
        // ensures that whenever we save the plot, it won't open up a new window
        // if we always set open to true, a "new" plot config will be saved, with open = true
        // this would open up a new window, which we don't want
        ...imageConfig,
        ...(newRecordId
          ? {
              recordId: newRecordId,
              title: `Image ${imageConfig.channelName} ${newRecordId}`,
              bitDepth: newBitDepth,
            }
          : {}),
      };
      dispatch(updateWindow(configToSave));
      setCrosshair(undefined);
    },
    [imageConfig, dispatch]
  );

  const [imageDims, setImageDims] = React.useState({ width: 0, height: 0 });

  return (
    <WindowPortal
      ref={imageWindowRef}
      title={title}
      onClose={onClose}
      innerWidth={imageConfig.innerWidth}
      innerHeight={imageConfig.innerHeight}
      screenX={imageConfig.screenX}
      screenY={imageConfig.screenY}
    >
      <Grid
        container
        direction="row"
        id="image-window"
        sx={(theme) => ({
          position: 'relative',
          height: '100%',
          backgroundColor: theme.palette.background.default,
        })}
        spacing={1}
        wrap="nowrap"
      >
        <Grid container item xs="auto">
          <ThumbnailSelector
            channelName={channelName}
            recordId={recordId}
            changeWindowConfig={updateImageConfig}
          />
        </Grid>
        <Grid
          container
          item
          direction="column"
          wrap="nowrap"
          xs="auto"
          spacing={1}
        >
          <Grid container item justifyContent="flex-end" wrap="nowrap" mt={1}>
            <ImageButtons data={image} title={title} resetView={resetView} />
          </Grid>
          <Grid
            container
            item
            wrap="nowrap"
            direction={crosshairsMode ? 'column' : 'row'}
            spacing={crosshairsMode ? 0 : 1}
            data-testid="image-panel"
            xs="auto"
          >
            <Grid container item wrap="nowrap" spacing={1}>
              <Grid item xs="auto">
                <ImageView
                  image={image}
                  title={title}
                  viewReset={viewFlag}
                  crosshairsMode={crosshairsMode}
                  crosshair={crosshair}
                  changeCrosshair={setCrosshair}
                  changeImageDims={setImageDims}
                />
              </Grid>

              <Grid
                item
                xs="auto"
                style={{
                  // display: none means it takes up no space in the UI
                  display: crosshairsMode ? 'flex' : 'none',
                  // visibility: hidden means it takes up space but just isn't visible
                  visibility: crosshairData && crosshair ? 'visible' : 'hidden',
                }}
              >
                <YImagePlot
                  data={crosshairData?.column.intensity ?? { x: [], y: [] }}
                  crosshairPosition={crosshair?.y}
                  imageDims={imageDims}
                />
              </Grid>
            </Grid>
            <Grid container item wrap="nowrap" spacing={1}>
              <Grid
                item
                xs="auto"
                style={{
                  // display: none means it takes up no space in the UI
                  display: crosshairsMode ? 'flex' : 'none',
                  // visibility: hidden means it takes up space but just isn't visible
                  visibility: crosshairData && crosshair ? 'visible' : 'hidden',
                }}
              >
                <XImagePlot
                  data={crosshairData?.row.intensity ?? { x: [], y: [] }}
                  crosshairPosition={crosshair?.x}
                  imageDims={imageDims}
                />
              </Grid>
              <Grid item mb={1}>
                <ImageControlsPanel
                  colourMap={colourMap}
                  lowerLevel={lowerLevel}
                  upperLevel={upperLevel}
                  crosshairsMode={crosshairsMode}
                  changeColourMap={setColourMap}
                  changeLowerLevel={setLowerLevel}
                  changeUpperLevel={setUpperLevel}
                  changeCrosshairsMode={setCrosshairsMode}
                  crosshairData={crosshairData}
                  bitDepth={bitDepth}
                  isFloat={imageConfig.type === 'float_image'}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <Backdrop
          component="div"
          sx={{ position: 'absolute', zIndex: 100, height: 'inherit' }}
          open={imageLoading}
          role="none"
          aria-hidden={false}
        >
          <CircularProgress
            id="image-loading-indicator"
            aria-label="Image loading"
          />
        </Backdrop>
      </Grid>
    </WindowPortal>
  );
};

export default ImageWindow;
