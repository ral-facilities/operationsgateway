import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { createSelector } from '@reduxjs/toolkit';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const everythingButConfigSelector = ({ config, ...state }: RootState) => state;
export const sessionSelector = createSelector(
  everythingButConfigSelector,
  (state) => state,
  {
    devModeChecks: {
      identityFunctionCheck: 'never',
      inputStabilityCheck: 'never',
    },
  }
);
