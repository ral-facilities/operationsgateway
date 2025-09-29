import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { sub } from 'date-fns';
import { convertApiTimestampToDate, formatDateTimeForApi } from '../../api/api';
import { SearchParams } from '../../app.types';
import { MAX_SHOTS_VALUES } from '../../search/components/maxShots.component';
import { RootState } from '../store';
import { selectQueryFilters } from './filterSlice';
import { selectQueryFunctions } from './functionsSlice';
import { selectPage, selectResultsPerPage, selectSort } from './tableSlice';

// Define a type for the slice state
interface SearchState {
  searchParams: SearchParams;
}

// use function so Date is initialised when initialState is needed, not generally
// also makes things easier in tests when mocking the date
export const initialStateFunc = (): SearchState => {
  const to = new Date();
  to.setSeconds(59);
  const from = sub(new Date(to), {
    hours: 24,
  });
  from.setSeconds(0);

  return {
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
};

export const searchSlice = createSlice({
  name: 'search',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: initialStateFunc,
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

const selectSearchDateRange = (state: RootState) =>
  state.search.searchParams.dateRange;

export const selectDateRangeInLocalTime = createSelector(
  selectSearchDateRange,
  (dateRange) => ({
    fromDate: dateRange.fromDate
      ? convertApiTimestampToDate(dateRange.fromDate)
      : undefined,
    toDate: dateRange.toDate
      ? convertApiTimestampToDate(dateRange.toDate)
      : undefined,
  })
);

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
