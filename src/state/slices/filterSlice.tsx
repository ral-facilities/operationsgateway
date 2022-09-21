import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
  Input,
  SearchCondition,
  Token,
} from '../../filtering/filterInput.component';

// Define a type for the slice state
interface FilterState {
  appliedFilters: Token[][];
}

// Define the initial state using that type
export const initialState = {
  appliedFilters: [],
} as FilterState;

export const filterSlice = createSlice({
  name: 'filter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    changeAppliedFilters: (state, action: PayloadAction<Token[][]>) => {
      state.appliedFilters = action.payload;
    },
  },
});

export const { changeAppliedFilters } = filterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAppliedFilters = (state: RootState) =>
  state.filter.appliedFilters;

export const selectQueryFilters = createSelector(
  selectAppliedFilters,
  (appliedFilters) => {
    return appliedFilters.map((filter) => {
      const input = new Input(filter);
      try {
        const searchCondition = new SearchCondition(input);
        return searchCondition.toString();
      } catch (e) {
        // this shouldn't happen, as we should block the application of invalid filters
        // in the filterInput
        return '';
      }
    });
  }
);

export default filterSlice.reducer;
