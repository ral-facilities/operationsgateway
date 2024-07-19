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
import { WindowPortal as WindowPortalClass } from '../windows/windowPortal.component';

type WindowsRefType = Record<string, React.RefObject<WindowPortalClass>>;

// do some type fiddling to allow ref to be mutable, initialise and then remove the null type
const initWindowsRef: React.MutableRefObject<WindowsRefType | null> =
  React.createRef();
initWindowsRef.current = {};
const windowsRef = initWindowsRef as React.MutableRefObject<WindowsRefType>;

export const WindowContext = React.createContext(windowsRef);

export const WindowContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <WindowContext.Provider value={windowsRef}>
      {children}
    </WindowContext.Provider>
  );
};

const OpenWindows = () => {
  const openPlots = Object.values(useAppSelector(selectOpenPlots));
  const openTraces = Object.values(useAppSelector(selectTraceWindows));
  const openImages = Object.values(useAppSelector(selectImageWindows));
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
      {openTraces.map((window: TraceOrImageWindow) => {
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
      {openImages.map((window: TraceOrImageWindow) => {
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
    </>
  );
};

export default OpenWindows;
