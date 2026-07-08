import React from 'react';
import { thumbnailSelectorWidth } from '../windows/thumbnailSelector.component';
import { imageButtonsHeight } from '../windows/windowButtons.component';
import { imageControlsPanelWidth } from './imageControlsPanel.component';
import { imagePlotInitWidthAndHeight } from './imagePlot.component';

export interface ImageViewProps {
  image: string | undefined;
  title: string;
  viewReset: boolean;
  crosshairsMode: boolean;
  crosshair?: { x: number; y: number };
  changeCrosshair: (value: { x: number; y: number }) => void;
  changeImageDims: (value: { width: number; height: number }) => void;
  imageDims: { width: number; height: number };
  imageContainerRef: React.MutableRefObject<HTMLDivElement | null>;
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

export function getScrollBarWidth(): number {
  const el = document.createElement('div');
  el.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;';
  document.body.appendChild(el);
  const width = el.offsetWidth - el.clientWidth;
  el.remove();
  return width;
}

export const getAdjustedImageWidth = (crosshairsMode: boolean): string => {
  return crosshairsMode
    ? `calc(100vw -
        ${thumbnailSelectorWidth}px -
        8px -
        8px -
        8px -
        8px -
        ${imageControlsPanelWidth}px -
        ${imagePlotInitWidthAndHeight}px)`
    : `calc(100vw -
        ${thumbnailSelectorWidth}px -
        8px -
        8px -
        8px -
        8px -
        ${imageControlsPanelWidth}px)`;
};

export const getAdjustedImageHeight = (crosshairsMode: boolean): string => {
  return crosshairsMode
    ? `calc(100vh - 8px - ${imageButtonsHeight}px - 8px - 8px - 12px - ${imagePlotInitWidthAndHeight}px)`
    : `calc(100vh - 8px - ${imageButtonsHeight}px - 8px - 8px)`;
};

export const calculateImageDimensionsToFitWindow = (
  dimension: 'width' | 'height',
  imageDims: ImageViewProps['imageDims'],
  crosshairsMode: boolean
) => {
  if (dimension === 'width')
    return `min(${getAdjustedImageWidth(
      crosshairsMode
    )}, (${imageDims.width} / ${imageDims.height}) * ${getAdjustedImageHeight(
      crosshairsMode
    )}, ${imageDims.width}px)`;
  else
    return `min(${getAdjustedImageHeight(
      crosshairsMode
    )}, (${imageDims.height} / ${imageDims.width}) * ${getAdjustedImageWidth(
      crosshairsMode
    )}, ${imageDims.height}px)`;
};

const ImageView = (props: ImageViewProps) => {
  const {
    image,
    viewReset,
    title,
    crosshairsMode,
    crosshair,
    changeCrosshair,
    changeImageDims,
    imageDims,
    imageContainerRef,
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
  const crosshairRef = React.useRef(crosshair);

  // set up the overlay
  React.useEffect(() => {
    if (overlay && img) {
      img.onload = () => {
        changeImageDims({ width: img.naturalWidth, height: img.naturalHeight });

        // manually update css width with image dims so we can set accurate initial canvas width/height
        overlay.style.height = calculateImageDimensionsToFitWindow(
          'height',
          { width: img.naturalWidth, height: img.naturalHeight },
          false
        );
        overlay.style.width = calculateImageDimensionsToFitWindow(
          'width',
          { width: img.naturalWidth, height: img.naturalHeight },
          false
        );

        overlay.width = overlay.offsetWidth;
        overlay.height = overlay.offsetHeight;
        overlay.style.imageRendering = 'pixelated';

        // can't just set canvas size via CSS as that causes scaling issues, so use resize observer
        // to observe when the CSS/display size changes and sync it to the canvas height & width properties
        // also need to account for dpi to ensure things are drawn at correct scale
        const onResize: ResizeObserverCallback = (entries) => {
          if (overlay) {
            for (const _ of entries) {
              const dpr =
                overlay.ownerDocument.defaultView?.devicePixelRatio ?? 1;

              const cssWidth = overlay.offsetWidth;
              const cssHeight = overlay.offsetHeight;

              const displayWidth = Math.round(cssWidth * dpr);
              const displayHeight = Math.round(cssHeight * dpr);

              overlay.width = displayWidth;
              overlay.height = displayHeight;

              const ctx = overlay.getContext('2d');
              ctx?.setTransform(1, 0, 0, 1, 0, 0);
              ctx?.scale(
                overlay.ownerDocument.defaultView?.devicePixelRatio ?? 1,
                overlay.ownerDocument.defaultView?.devicePixelRatio ?? 1
              );
              if (crosshairRef.current)
                drawCrosshair(crosshairRef.current, overlay);
            }
          }
        };

        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(overlay);

        return () => {
          resizeObserver.disconnect();
        };
      };
    }
  }, [img, image, overlay, changeImageDims]);

  React.useEffect(() => {
    setPan([0, 0]);
    setZoom(1);
  }, [viewReset]);

  React.useEffect(() => {
    if (crosshairsMode) {
      setPan([0, 0]);
      setZoom(1);
      // set correct new dimensions when switching modes
      if (overlay && img) {
        overlay.width = img.naturalWidth;
        overlay.height = img.naturalHeight;
      }
    } else if (overlay && img) {
      // set correct new dimensions when switching modes
      overlay.style.height = calculateImageDimensionsToFitWindow(
        'height',
        { width: img.naturalWidth, height: img.naturalHeight },
        false
      );
      overlay.style.width = calculateImageDimensionsToFitWindow(
        'width',
        { width: img.naturalWidth, height: img.naturalHeight },
        false
      );

      overlay.width = overlay.offsetWidth;
      overlay.height = overlay.offsetHeight;
      const ctx = overlay.getContext('2d');
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
      // need to wrap in setTimeout to clear properly on chrome
      setTimeout(() => {
        ctx?.clearRect(0, 0, overlay.width, overlay.height);
      }, 0);
    }
  }, [crosshairsMode, img, overlay]);

  React.useEffect(() => {
    crosshairRef.current = crosshair;
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
      <div
        style={{
          display: 'grid',
          overflow: crosshairsMode ? 'auto' : 'hidden',
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin',
          height:
            imageDims.width > 0
              ? calculateImageDimensionsToFitWindow(
                  'height',
                  imageDims,
                  crosshairsMode
                )
              : undefined,
          width:
            imageDims.height > 0
              ? calculateImageDimensionsToFitWindow(
                  'width',
                  imageDims,
                  crosshairsMode
                )
              : undefined,
        }}
        ref={imageContainerRef}
      >
        <img
          src={image}
          alt={title}
          ref={imgRef}
          style={{
            gridArea: '1 / 1',
            transform: `translate(${pan[0]}px,${pan[1]}px) scale(${zoom})`,
            transformOrigin: 'top left',
            imageRendering: 'pixelated',
            maxHeight:
              imageDims.height > 0 && !crosshairsMode
                ? getAdjustedImageHeight(false)
                : undefined,
            maxWidth:
              imageDims.width > 0 && !crosshairsMode
                ? getAdjustedImageWidth(false)
                : undefined,
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
        <canvas
          data-testid="overlay"
          ref={overlayRef}
          // have pointer-events: none and click handlers on img instead of canvas
          // so that right clicking the image to bring up context menu is done on the
          // img not the canvas
          style={{
            gridArea: '1 / 1',
            zIndex: 2,
            pointerEvents: 'none',
            height: crosshairsMode
              ? imageDims.height
              : calculateImageDimensionsToFitWindow('height', imageDims, false),
            width: crosshairsMode
              ? imageDims.width
              : calculateImageDimensionsToFitWindow('width', imageDims, false),
          }}
        />
      </div>
    </div>
  );
};

export default ImageView;
