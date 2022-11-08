import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { SearchParams } from '../../app.types';
import { selectPage, selectSort, selectResultsPerPage } from './tableSlice';
import { selectQueryFilters } from './filterSlice';
import {
  ABSOLUTE_MINIMUM,
  ABSOLUTE_MAXIMUM,
} from '../../search/components/shotNumber.component';

// Define a type for the slice state
interface SearchState {
  searchParams: SearchParams;
}

// Define the initial state using that type
export const initialState = {
  searchParams: {
    dateRange: {},
    shotnumRange: {
      min: ABSOLUTE_MINIMUM,
      max: ABSOLUTE_MAXIMUM,
    },
  },
} as SearchState;

export const searchSlice = createSlice({
  name: 'search',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    changeSearchParams: (state, action: PayloadAction<SearchParams>) => {
      state.searchParams = { ...action.payload };
    },
  },
});

export const { changeSearchParams } = searchSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectSearchParams = (state: RootState) =>
  state.search.searchParams;

export const selectQueryParams = createSelector(
  selectSearchParams,
  selectSort,
  selectPage,
  selectResultsPerPage,
  selectQueryFilters,
  (searchParams, sort, page, resultsPerPage, filters) => ({
    searchParams,
    sort,
    filters,
    page,
    resultsPerPage,
  })
);

export default searchSlice.reducer;
