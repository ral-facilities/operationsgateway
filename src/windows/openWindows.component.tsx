import React from 'react';
import ImageWindow from '../images/imageWindow.component';
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
  selectVectorWindows,
  WindowConfigType,
} from '../state/slices/windowSlice';
import TraceWindow from '../traces/traceWindow.component';
import VectorWindow from '../vectors/vectorWindow.component';
import { WindowContext } from './windowContext';

const OpenWindows = () => {
  const openPlots = Object.values(useAppSelector(selectOpenPlots));
  const openTraces = Object.values(useAppSelector(selectTraceWindows));
  const openImages = Object.values(useAppSelector(selectImageWindows));
  const openVectors = Object.values(useAppSelector(selectVectorWindows));
  const dispatch = useAppDispatch();

  const windowsRef = React.useContext(WindowContext);

  return (
    <>
      {openPlots.map((plot: PlotConfig) => {
        if (!windowsRef.current[plot.id])
          windowsRef.current[plot.id] = React.createRef();
        return (
          <PlotWindow
            key={plot.id}
            plotConfig={plot}
            onClose={() => {
              dispatch(closePlot(plot.id));
            }}
            plotWindowRef={windowsRef.current[plot.id]}
          />
        );
      })}
      {openTraces.map((window: WindowConfigType) => {
        if (!windowsRef.current[window.id])
          windowsRef.current[window.id] = React.createRef();
        return (
          <TraceWindow
            key={window.id}
            traceConfig={window}
            onClose={() => {
              dispatch(closeWindow(window.id));
            }}
            traceWindowRef={windowsRef.current[window.id]}
          />
        );
      })}
      {openImages.map((window: WindowConfigType) => {
        if (!windowsRef.current[window.id])
          windowsRef.current[window.id] = React.createRef();
        return (
          <ImageWindow
            key={window.id}
            imageConfig={window}
            onClose={() => {
              dispatch(closeWindow(window.id));
            }}
            imageWindowRef={windowsRef.current[window.id]}
          />
        );
      })}
      {openVectors.map((window: WindowConfigType) => {
        if (!windowsRef.current[window.id])
          windowsRef.current[window.id] = React.createRef();
        return (
          <VectorWindow
            key={window.id}
            vectorConfig={window}
            onClose={() => {
              dispatch(closeWindow(window.id));
            }}
            vectorWindowRef={windowsRef.current[window.id]}
          />
        );
      })}
    </>
  );
};

export default OpenWindows;
