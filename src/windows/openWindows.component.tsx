import React from 'react';
import PlotWindow from '../plotting/plotWindow.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  closePlot,
  PlotConfig,
  selectOpenPlots,
} from '../state/slices/plotSlice';
import {
  closeWindow,
  selectImageWindows,
  selectTraceWindows,
  TraceOrImageWindow,
} from '../state/slices/windowSlice';
import TraceWindow from '../traces/traceWindow.component';
import ImageWindow from '../images/imageWindow.component';

const OpenWindows = () => {
  const openPlots = Object.values(useAppSelector(selectOpenPlots));
  const openTraces = Object.values(useAppSelector(selectTraceWindows));
  const openImages = Object.values(useAppSelector(selectImageWindows));
  const dispatch = useAppDispatch();
  return (
    <>
      {openPlots.map((plot: PlotConfig) => {
        return (
          <PlotWindow
            key={plot.title}
            plotConfig={plot}
            onClose={() => {
              dispatch(closePlot(plot.title));
            }}
          />
        );
      })}
      {openTraces.map((window: TraceOrImageWindow) => {
        return (
          <TraceWindow
            key={window.title}
            traceConfig={window}
            onClose={() => {
              dispatch(closeWindow(window.title));
            }}
          />
        );
      })}
      {openImages.map((window: TraceOrImageWindow) => {
        return (
          <ImageWindow
            key={window.title}
            imageConfig={window}
            onClose={() => {
              dispatch(closeWindow(window.title));
            }}
          />
        );
      })}
    </>
  );
};

export default OpenWindows;
