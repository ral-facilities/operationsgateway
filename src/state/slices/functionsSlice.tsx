import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { convertExpressionsToStrings } from '../../api/functions';
import { ValidateFunctionState } from '../../app.types';
import { RootState } from '../store';

// Define a type for the slice state
interface FunctionsState {
  appliedFunctions: ValidateFunctionState[];
}

// Define the initial state using that type
export const initialState = {
  appliedFunctions: [],
} as FunctionsState;

export const functionsSlice = createSlice({
  name: 'functions',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    changeAppliedFunctions: (
      state,
      action: PayloadAction<ValidateFunctionState[]>
    ) => {
      state.appliedFunctions = action.payload;
    },
  },
});

export const { changeAppliedFunctions } = functionsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAppliedFunctions = (state: RootState) =>
  state.functions.appliedFunctions;

export const selectQueryFunctions = createSelector(
  selectAppliedFunctions,
  (appliedFunctions) =>
    JSON.parse(convertExpressionsToStrings(appliedFunctions))
);

export default functionsSlice.reducer;
