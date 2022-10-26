import React from 'react';
import PlotWindow from './plotWindow.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  closePlot,
  PlotConfig,
  selectOpenPlots,
} from '../state/slices/plotSlice';

const OpenPlots = () => {
  const openPlots = Object.values(useAppSelector(selectOpenPlots));
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
    </>
  );
};

export default OpenPlots;
