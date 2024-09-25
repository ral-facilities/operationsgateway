import React from 'react';

export interface ImageViewProps {
  image: string | undefined;
  title: string;
  viewReset: boolean;
}

const ImageView = (props: ImageViewProps) => {
  const { image, viewReset, title } = props;

  const overlayPropsRef = React.useRef<{
    startX: number;
    startY: number;
    prevStartY: number;
    prevStartX: number;
    prevWidth: number;
    prevHeight: number;
    isPanning: boolean;
    isZooming: boolean;
  }>({
    isPanning: false,
    isZooming: false,
    prevStartX: 0,
    prevStartY: 0,
    prevHeight: 0,
    prevWidth: 0,
    startX: 0,
    startY: 0,
  });

  const [pan, setPan] = React.useState([0, 0]);
  const [zoom, setZoom] = React.useState(1);

  const overlayProps = overlayPropsRef.current;

  // need to use callback refs as otherwise normal refs are null after unmounting & remounting
  const [overlay, setOverlay] = React.useState<HTMLCanvasElement | null>(null);
  const overlayRef = React.useCallback((node: HTMLCanvasElement) => {
    setOverlay(node);
  }, []);

  const [img, setImg] = React.useState<HTMLImageElement | null>(null);
  const imgRef = React.useCallback((node: HTMLImageElement) => {
    setImg(node);
  }, []);

  // set up the overlay
  React.useEffect(() => {
    if (overlay && img) {
      img.onload = () => {
        overlay.width = img.width;
        overlay.height = img.height;
      };
    }
  }, [img, image, overlay]);

  React.useEffect(() => {
    setPan([0, 0]);
    setZoom(1);
  }, [viewReset]);

  const mouseDownHandler: React.MouseEventHandler = React.useCallback(
    (e) => {
      if (e.button !== 0) {
        // not left mouse click - ignore
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const rect = overlay?.getBoundingClientRect();

      // save the starting x/y of the click
      overlayProps.startX = e.clientX - (rect?.left ?? 0);
      overlayProps.startY = e.clientY - (rect?.top ?? 0);

      if (e.shiftKey) {
        overlayProps.prevStartX = overlayProps.startX;
        overlayProps.prevStartY = overlayProps.startY;

        overlayProps.isPanning = true;
      } else {
        // set a flag indicating the drag has begun
        overlayProps.isZooming = true;
      }
    },
    [overlayProps, overlay]
  );

  const mouseMoveHandler: React.MouseEventHandler = React.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      // if we're not panning or zooming, just return
      if (!overlay || (!overlayProps.isZooming && !overlayProps.isPanning)) {
        return;
      }

      const rect = overlay.getBoundingClientRect();

      // get the current mouse position relative to the canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const originalWidth = overlay.width;
      const originalHeight = overlay.height;

      if (overlayProps.isZooming) {
        // calculate the rectangle width/height based
        // on starting vs current mouse position
        const width = mouseX - overlayProps.startX;
        const height = mouseY - overlayProps.startY;

        const ctx = overlay.getContext('2d');
        if (ctx?.strokeStyle) ctx.strokeStyle = 'red';
        // clear the overlay
        ctx?.clearRect(0, 0, originalWidth, originalHeight);

        // enforce a zoom region that matches the original ratio of the image

        const aspectRatio = originalWidth / originalHeight;

        const h2 = Math.abs(width) / aspectRatio;
        const w2 = Math.abs(height) * aspectRatio;

        let adjustedWidth = width;
        let adjustedHeight = height;

        if (Math.abs(width) > w2) {
          adjustedHeight = height >= 0 ? h2 : -h2;
        } else {
          adjustedWidth = width >= 0 ? w2 : -w2;
        }

        // draw a new rect from the start position
        // to the current mouse position
        ctx?.strokeRect(
          overlayProps.startX,
          overlayProps.startY,
          adjustedWidth,
          adjustedHeight
        );

        overlayProps.prevWidth = adjustedWidth;
        overlayProps.prevHeight = adjustedHeight;
      }

      if (overlayProps.isPanning) {
        const xDiff = mouseX - overlayProps.prevStartX;
        const yDiff = mouseY - overlayProps.prevStartY;
        setPan((oldPan) => {
          let newX = oldPan[0] + xDiff;
          let newY = oldPan[1] + yDiff;

          // make sure pan doesn't go out of bounds
          if (newX > 0) newX = 0;
          if (newY > 0) newY = 0;
          if (-originalWidth * (zoom - 1) > newX) newX = oldPan[0];
          if (-originalHeight * (zoom - 1) > newY) newY = oldPan[1];

          return [newX, newY];
        });
      }

      overlayProps.prevStartX = mouseX;
      overlayProps.prevStartY = mouseY;
    },
    [overlay, overlayProps, zoom]
  );

  const mouseUpOutHandler: React.MouseEventHandler = React.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (overlay && overlayProps.isZooming) {
        // the drag is over, clear the dragging flag
        overlayProps.isZooming = false;

        const { startX, startY, prevWidth, prevHeight } = overlayProps;

        const boxWidth = Math.abs(prevWidth);
        const boxHeight = Math.abs(prevHeight);

        const boxLeft = prevWidth < 0 ? startX - boxWidth : startX;
        const boxTop = prevHeight < 0 ? startY - boxHeight : startY;

        // don't perform zoom if zoom box is too small, or if zoom box is out of bounds
        if (
          (boxWidth > 10 || boxHeight > 10) &&
          boxLeft + boxWidth < overlay.width + 10 &&
          boxTop + boxHeight < overlay.height + 10 &&
          boxLeft > -10 &&
          boxTop > -10
        ) {
          // zoomFactor is the same for both axis due to us enforcing same aspect ratio
          // so arbitrarily pick one of width or height here
          const zoomFactor = overlay.width / boxWidth;

          setZoom((oldZoom) => zoomFactor * oldZoom);
          setPan((oldPan) => {
            let newX = (oldPan[0] - boxLeft) * zoomFactor;
            let newY = (oldPan[1] - boxTop) * zoomFactor;

            // make sure pan doesn't go out of bounds
            if (newX > 0) newX = 0;
            if (newY > 0) newY = 0;
            if (-overlay.width * (zoomFactor * zoom - 1) > newX)
              newX = -overlay.width * (zoomFactor * zoom - 1);
            if (-overlay.height * (zoomFactor * zoom - 1) > newY)
              newY = -overlay.height * (zoomFactor * zoom - 1);

            return [newX, newY];
          });
        }

        // clear the overlay
        const ctx = overlay.getContext('2d');
        ctx?.clearRect(0, 0, overlay.width, overlay.height);
      }
      if (overlayProps.isPanning) {
        overlayProps.isPanning = false;
      }

      // reset box properties
      overlayProps.prevStartX = 0;
      overlayProps.prevStartX = 0;
      overlayProps.startX = 0;
      overlayProps.startY = 0;
      overlayProps.prevHeight = 0;
      overlayProps.prevWidth = 0;
    },
    [overlay, overlayProps, zoom]
  );

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        data-testid="overlay"
        ref={overlayRef}
        // have pointer-events: none and click handlers on img instead of canvas
        // so that right clicking the image to bring up context menu is done on the
        // img not the canvas
        style={{ position: 'absolute', zIndex: 2, pointerEvents: 'none' }}
      />
      <div style={{ display: 'inline-block', overflow: 'hidden' }}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <img
          src={image}
          alt={title}
          ref={imgRef}
          style={{
            transform: `translate(${pan[0]}px,${pan[1]}px) scale(${zoom})`,
            transformOrigin: 'top left',
            imageRendering: 'pixelated',
          }}
          onMouseDown={mouseDownHandler}
          onMouseMove={mouseMoveHandler}
          onMouseUp={mouseUpOutHandler}
          // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
          onMouseOut={mouseUpOutHandler}
        />
      </div>
    </div>
  );
};

export default ImageView;
