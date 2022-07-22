import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { DateRange } from '../../app.types';
import { selectPage, selectSort, selectResultsPerPage } from './columnsSlice';

// Define a type for the slice state
interface SearchState {
  dateRange: DateRange;
}

// Define the initial state using that type
export const initialState = {
  dateRange: {},
} as SearchState;

export const searchSlice = createSlice({
  name: 'search',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    changeDateRange: (
      state,
      action: PayloadAction<{ range: keyof DateRange; date?: string }>
    ) => {
      const { range, date } = action.payload;
      state.dateRange[range] = date;
    },
  },
});

export const { changeDateRange } = searchSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectDateRange = (state: RootState) => state.search.dateRange;

export const selectQueryParams = createSelector(
  selectDateRange,
  selectSort,
  selectPage,
  selectResultsPerPage,
  (dateRange, sort, page, resultsPerPage) => ({
    dateRange,
    sort,
    page,
    resultsPerPage,
  })
);

export default searchSlice.reducer;
