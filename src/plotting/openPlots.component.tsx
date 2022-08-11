import React from 'react';
import PlotWindow from './plotWindow.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { closePlot, selectOpenPlots } from '../state/slices/plotSlice';

const OpenPlots = () => {
  const openPlots = Object.keys(useAppSelector(selectOpenPlots));
  const dispatch = useAppDispatch();
  return (
    <>
      {openPlots.map((item) => {
        return (
          <PlotWindow
            key={item}
            untitledTitle={item}
            onClose={() => {
              dispatch(closePlot(item));
            }}
          />
        );
      })}
    </>
  );
};

export default OpenPlots;
