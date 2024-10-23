import React from 'react';

export interface ImageViewProps {
  image: string | undefined;
  title: string;
  viewReset: boolean;
  crosshairsMode: boolean;
  crosshair?: { x: number; y: number };
  changeCrosshair: (value: { x: number; y: number }) => void;
}

const drawCrosshair = (
  crosshair: { x: number; y: number },
  canvas: HTMLCanvasElement
): void => {
  const ctx = canvas.getContext('2d');

  if (ctx?.strokeStyle) ctx.strokeStyle = 'red';
  if (ctx?.lineWidth) ctx.lineWidth = 1;
  if (ctx?.lineCap) ctx.lineCap = 'square';

  const { width: overlayWidth, height: overlayHeight } =
    canvas.getBoundingClientRect();
  // clear the overlay
  ctx?.clearRect(0, 0, overlayWidth, overlayHeight);

  // draw vertical line
  ctx?.beginPath();
  ctx?.moveTo(crosshair.x + 0.5, 0.5); // adding half a pixel makes the lines sharper, see: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#a_linewidth_example
  ctx?.lineTo(crosshair.x + 0.5, overlayHeight + 0.5);
  ctx?.stroke();

  // draw horizontal line
  ctx?.beginPath();
  ctx?.moveTo(0.5, crosshair.y + 0.5);
  ctx?.lineTo(overlayWidth + 0.5, crosshair.y + 0.5);
  ctx?.stroke();
};

const ImageView = (props: ImageViewProps) => {
  const {
    image,
    viewReset,
    title,
    crosshairsMode,
    crosshair,
    changeCrosshair,
  } = props;

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
        overlay.style.width = `${img.width}px`;
        overlay.style.height = `${img.height}px`;
        overlay.style.imageRendering = 'pixelated';

        // from: https://webgl2fundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
        // although we simplify that code into doing all the canvas manip in the resize func
        const onResize: ResizeObserverCallback = (entries) => {
          if (overlay) {
            for (const entry of entries) {
              let width;
              let height;
              let dpr =
                overlay.ownerDocument.defaultView?.devicePixelRatio ?? 1;
              if (entry.devicePixelContentBoxSize) {
                // NOTE: Only this path gives the correct answer
                // The other paths are imperfect fallbacks
                // for browsers that don't provide anyway to do this
                width = entry.devicePixelContentBoxSize[0].inlineSize;
                height = entry.devicePixelContentBoxSize[0].blockSize;
                dpr = 1; // it's already in width and height
              } else if (entry.contentBoxSize) {
                if (entry.contentBoxSize[0]) {
                  width = entry.contentBoxSize[0].inlineSize;
                  height = entry.contentBoxSize[0].blockSize;
                } else {
                  // @ts-expect-error we expect an error here as this code is covering old browsers where the type was different
                  width = entry.contentBoxSize.inlineSize;
                  // @ts-expect-error we expect an error here as this code is covering old browsers where the type was different
                  height = entry.contentBoxSize.blockSize;
                }
              } else {
                width = entry.contentRect.width;
                height = entry.contentRect.height;
              }
              const displayWidth = Math.round(width * dpr);
              const displayHeight = Math.round(height * dpr);

              overlay.width = displayWidth;
              overlay.height = displayHeight;

              const ctx = overlay.getContext('2d');
              ctx?.setTransform(1, 0, 0, 1, 0, 0);
              ctx?.scale(
                overlay.ownerDocument.defaultView?.devicePixelRatio ?? 1,
                overlay.ownerDocument.defaultView?.devicePixelRatio ?? 1
              );
            }
          }
        };

        const resizeObserver = new ResizeObserver(onResize);
        try {
          // only call us of the number of device pixels changed
          resizeObserver.observe(overlay, { box: 'device-pixel-content-box' });
        } catch {
          // device-pixel-content-box is not supported so fallback to this
          resizeObserver.observe(overlay, { box: 'content-box' });
        }

        return () => {
          resizeObserver.disconnect();
        };
      };
    }
  }, [img, image, overlay]);

  React.useEffect(() => {
    setPan([0, 0]);
    setZoom(1);
  }, [viewReset]);

  React.useEffect(() => {
    if (crosshairsMode) {
      setPan([0, 0]);
      setZoom(1);
    } else if (overlay) {
      const { width: overlayWidth, height: overlayHeight } =
        overlay.getBoundingClientRect();
      const ctx = overlay.getContext('2d');
      ctx?.clearRect(0, 0, overlayWidth, overlayHeight);
    }
  }, [crosshairsMode, overlay]);

  React.useEffect(() => {
    if (crosshair && overlay) {
      drawCrosshair(crosshair, overlay);
    }
  }, [crosshair, overlay]);

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

      const { width: overlayWidth, height: overlayHeight } = rect;

      if (overlayProps.isZooming) {
        // calculate the rectangle width/height based
        // on starting vs current mouse position
        const width = mouseX - overlayProps.startX;
        const height = mouseY - overlayProps.startY;

        const ctx = overlay.getContext('2d');
        if (ctx?.strokeStyle) ctx.strokeStyle = 'red';
        // clear the overlay
        ctx?.clearRect(0, 0, overlayWidth, overlayHeight);

        // enforce a zoom region that matches the original ratio of the image

        const aspectRatio = overlayWidth / overlayHeight;

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
          overlayProps.startX + 0.5, // adding half a pixel makes lines sharper, see: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#a_linewidth_example
          overlayProps.startY + 0.5,
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
          if (-overlayWidth * (zoom - 1) > newX) newX = oldPan[0];
          if (-overlayHeight * (zoom - 1) > newY) newY = oldPan[1];

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

        const { width: overlayWidth, height: overlayHeight } =
          overlay.getBoundingClientRect();

        // don't perform zoom if zoom box is too small, or if zoom box is out of bounds
        if (
          (boxWidth > 10 || boxHeight > 10) &&
          boxLeft + boxWidth < overlayWidth + 10 &&
          boxTop + boxHeight < overlayHeight + 10 &&
          boxLeft > -10 &&
          boxTop > -10
        ) {
          // zoomFactor is the same for both axis due to us enforcing same aspect ratio
          // so arbitrarily pick one of width or height here
          const zoomFactor = overlayWidth / boxWidth;

          setZoom((oldZoom) => zoomFactor * oldZoom);
          setPan((oldPan) => {
            let newX = (oldPan[0] - boxLeft) * zoomFactor;
            let newY = (oldPan[1] - boxTop) * zoomFactor;

            // make sure pan doesn't go out of bounds
            if (newX > 0) newX = 0;
            if (newY > 0) newY = 0;
            if (-overlayWidth * (zoomFactor * zoom - 1) > newX)
              newX = -overlayWidth * (zoomFactor * zoom - 1);
            if (-overlayHeight * (zoomFactor * zoom - 1) > newY)
              newY = -overlayHeight * (zoomFactor * zoom - 1);

            return [newX, newY];
          });
        }

        // clear the overlay
        const ctx = overlay.getContext('2d');
        ctx?.clearRect(0, 0, overlayWidth, overlayHeight);
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

  const mouseClickHandler: React.MouseEventHandler = React.useCallback(
    (e) => {
      if (e.button !== 0) {
        // not left mouse click - ignore
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const rect = overlay?.getBoundingClientRect();

      changeCrosshair({
        x: Math.round(e.clientX - (rect?.left ?? 0)),
        y: Math.round(e.clientY - (rect?.top ?? 0)),
      });
    },
    [changeCrosshair, overlay]
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
        {}
        <img
          src={image}
          alt={title}
          ref={imgRef}
          style={{
            transform: `translate(${pan[0]}px,${pan[1]}px) scale(${zoom})`,
            transformOrigin: 'top left',
            imageRendering: 'pixelated',
          }}
          {...(!crosshairsMode
            ? {
                onMouseDown: mouseDownHandler,
                onMouseMove: mouseMoveHandler,
                onMouseUp: mouseUpOutHandler,
                onMouseOut: mouseUpOutHandler,
              }
            : { onClick: mouseClickHandler })}
        />
      </div>
    </div>
  );
};

export default ImageView;
