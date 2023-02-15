import React from 'react';
import PlotWindow from './plotWindow.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  closePlot,
  PlotConfig,
  selectOpenPlots,
} from '../state/slices/plotSlice';
import {
  closeWindow,
  selectTraceWindows,
  TraceOrImageWindow,
} from '../state/slices/windowSlice';
import TraceWindow from './traceWindow.component';

const OpenPlots = () => {
  const openPlots = Object.values(useAppSelector(selectOpenPlots));
  const openTraces = Object.values(useAppSelector(selectTraceWindows));
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
    </>
  );
};

export default OpenPlots;
