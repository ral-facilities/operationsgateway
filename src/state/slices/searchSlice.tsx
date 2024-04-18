import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { SearchParams } from '../../app.types';
import { selectPage, selectSort, selectResultsPerPage } from './tableSlice';
import { selectQueryFilters } from './filterSlice';
import { MAX_SHOTS_VALUES } from '../../search/components/maxShots.component';
import { format, sub } from 'date-fns';

export const formatDateTimeForApi = (datetime: Date): string => {
  const dateString = format(datetime, 'yyyy-MM-dd');
  const timeString = format(datetime, 'HH:mm:ss');

  return `${dateString}T${timeString}`;
};

// Define a type for the slice state
interface SearchState {
  searchParams: SearchParams;
}

const to = new Date();
to.setSeconds(59);
const from = sub(new Date(to), {
  hours: 24,
});
from.setSeconds(0);

// Define the initial state using that type
export const initialState: SearchState = {
  searchParams: {
    dateRange: {
      toDate: formatDateTimeForApi(to),
      fromDate: formatDateTimeForApi(from),
    },
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
  (searchParams, sort, page, resultsPerPage, filters) => ({
    searchParams,
    sort,
    filters,
    page,
    resultsPerPage,
  })
);

export default searchSlice.reducer;
