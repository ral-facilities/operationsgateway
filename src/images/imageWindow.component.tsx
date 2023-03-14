import React from 'react';
import WindowPortal from '../windows/windowPortal.component';
import { TraceOrImageWindow } from '../state/slices/windowSlice';
import { Grid, Backdrop, CircularProgress } from '@mui/material';
import ImageView from './imageView.component';
import { ImageButtons } from '../windows/windowButtons.component';
import { useImage } from '../api/images';
import FalseColourPanel from './falseColourPanel.component';

interface ImageWindowProps {
  onClose: () => void;
  imageConfig: TraceOrImageWindow;
}

const ImageWindow = (props: ImageWindowProps) => {
  const { onClose, imageConfig } = props;
  const { channelName, recordId, title } = imageConfig;

  const [colourMap, setColourMap] = React.useState<string | undefined>(
    undefined
  );
  const [lowerLevel, setLowerLevel] = React.useState<number | undefined>(0);
  const [upperLevel, setUpperLevel] = React.useState<number | undefined>(255);

  const { data: image, isLoading: imageLoading } = useImage(
    recordId,
    channelName,
    {
      colourMap: colourMap,
      lowerLevel: lowerLevel,
      upperLevel: upperLevel,
    }
  );

  const windowRef = React.createRef<WindowPortal>();

  const [viewFlag, setViewFlag] = React.useState<boolean>(false);

  const resetView = React.useCallback(() => {
    setViewFlag((viewFlag) => !viewFlag);
  }, []);

  return (
    <WindowPortal
      ref={windowRef}
      title={title}
      onClose={onClose}
      outerWidth={imageConfig.outerWidth}
      outerHeight={imageConfig.outerHeight}
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
            <ImageButtons data={image} title={title} resetView={resetView} />
          </Grid>
          <Grid container item wrap="nowrap" spacing={1}>
            <Grid item>
              <ImageView image={image} title={title} viewReset={viewFlag} />
            </Grid>
            <Grid item>
              <FalseColourPanel
                colourMap={colourMap}
                lowerLevel={lowerLevel}
                upperLevel={upperLevel}
                changeColourMap={setColourMap}
                changeLowerLevel={setLowerLevel}
                changeUpperLevel={setUpperLevel}
              />
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
