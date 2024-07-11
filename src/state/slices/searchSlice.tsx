import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { SearchParams } from '../../app.types';
import { MAX_SHOTS_VALUES } from '../../search/components/maxShots.component';
import { RootState } from '../store';
import { selectQueryFilters } from './filterSlice';
import { selectQueryFunctions } from './functionsSlice';
import { selectPage, selectResultsPerPage, selectSort } from './tableSlice';

export const formatDateTimeForApi = (datetime: Date): string => {
  const dateString = format(datetime, 'yyyy-MM-dd');
  const timeString = format(datetime, 'HH:mm:ss');

  return `${dateString}T${timeString}`;
};

// Define a type for the slice state
interface SearchState {
  searchParams: SearchParams;
}

// Define the initial state using that type
export const initialState: SearchState = {
  searchParams: {
    dateRange: {},
    shotnumRange: {},
    maxShots: MAX_SHOTS_VALUES[0],
    experimentID: null,
  },
};

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
  selectQueryFunctions,
  (searchParams, sort, page, resultsPerPage, filters, functions) => ({
    searchParams,
    sort,
    filters,
    functions,
    page,
    resultsPerPage,
  })
);

export default searchSlice.reducer;
