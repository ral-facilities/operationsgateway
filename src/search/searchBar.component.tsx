import React from 'react';
import DateTime from './components/dateTime.component';
import Timeframe, {
  type TimeframeRange,
} from './components/timeframe.component';
import Experiment from './components/experiment.component';
import ShotNumber from './components/shotNumber.component';
import { Grid, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { DateRange, ShotnumRange } from '../app.types';
import { format } from 'date-fns';
import {
  changeSearchParams,
  selectSearchParams,
} from '../state/slices/searchSlice';

export type TimeframeDates = {
  fromDate: Date | null;
  toDate: Date | null;
};

const SearchBar = (): React.ReactElement => {
  const dispatch = useAppDispatch();

  const searchParams = useAppSelector(selectSearchParams); // the parameters sent to the search query itself
  const { dateRange, shotnumRange } = searchParams;

  // ########################
  // DATE-TIME FIELDS
  // ########################
  // The FROM and TO dates sent as part of the query (if any)
  const [searchParameterFromDate, setSearchParameterFromDate] =
    React.useState<Date | null>(
      dateRange.fromDate ? new Date(dateRange.fromDate) : null
    );
  const [searchParameterToDate, setSearchParameterToDate] =
    React.useState<Date | null>(
      dateRange.toDate ? new Date(dateRange.toDate) : null
    );

  // ########################
  // TIMEFRAME
  // ########################
  // Timeframe range is NOT sent as part of query
  // Instead, we use this to determine the FROM and TO dates
  // This is set in the timeframe search box by the user
  // If the user edits any of the date fields otherwise, this is set to null
  const [timeframeRange, setTimeframeRange] =
    React.useState<TimeframeRange | null>(null);

  const calculateTimeframeDateRange = (
    timeframe: TimeframeRange
  ): { from: Date; to: Date } => {
    const to = new Date();
    const from = new Date();

    switch (timeframe.timescale) {
      case 'minutes':
        from.setMinutes(to.getMinutes() - timeframe.value);
        break;
      case 'hours':
        from.setHours(to.getHours() - timeframe.value);
        break;
      case 'days':
        from.setDate(to.getDate() - timeframe.value);
        break;
    }

    return { from, to };
  };

  const setRelativeTimeframe = React.useCallback(
    (timeframe: TimeframeRange | null) => {
      if (timeframe == null) {
        setTimeframeRange(null);
        return;
      }

      const { from, to } = calculateTimeframeDateRange(timeframe);
      setTimeframeRange(timeframe);
      setSearchParameterFromDate(from);
      setSearchParameterToDate(to);
    },
    []
  );

  // ########################
  // SHOT NUMBER MIN AND MAX
  // ########################
  // The SHOT NUMBER MIN AND MAX fields sent as part of the query (if any)
  const [searchParameterShotnumMin, setSearchParameterShotnumMin] =
    React.useState<number | undefined>(shotnumRange.min ?? undefined);
  const [searchParameterShotnumMax, setSearchParameterShotnumMax] =
    React.useState<number | undefined>(shotnumRange.max ?? undefined);

  // ########################
  // INITIATING THE SEARCH
  // ########################
  const handleSearch = React.useCallback(() => {
    const newDateRange: DateRange = {
      fromDate: searchParameterFromDate
        ? format(searchParameterFromDate, 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      toDate: searchParameterToDate
        ? format(searchParameterToDate, 'yyyy-MM-dd HH:mm:ss')
        : undefined,
    };

    const newShotnumRange: ShotnumRange = {
      min: searchParameterShotnumMin,
      max: searchParameterShotnumMax,
    };

    dispatch(
      changeSearchParams({
        dateRange: newDateRange,
        shotnumRange: newShotnumRange,
      })
    );
  }, [
    dispatch,
    searchParameterFromDate,
    searchParameterShotnumMax,
    searchParameterShotnumMin,
    searchParameterToDate,
  ]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <DateTime
          searchParameterFromDate={searchParameterFromDate}
          searchParameterToDate={searchParameterToDate}
          changeSearchParameterFromDate={setSearchParameterFromDate}
          changeSearchParameterToDate={setSearchParameterToDate}
          resetTimeframe={() => setRelativeTimeframe(null)}
        />
      </Grid>
      <Grid item xs={2}>
        <Timeframe
          timeframe={timeframeRange}
          changeTimeframe={setRelativeTimeframe}
        />
      </Grid>
      <Grid item xs={2}>
        <Experiment />
      </Grid>
      <Grid item xs={2}>
        <ShotNumber
          searchParameterShotnumMin={searchParameterShotnumMin}
          searchParameterShotnumMax={searchParameterShotnumMax}
          changeSearchParameterShotnumMin={setSearchParameterShotnumMin}
          changeSearchParameterShotnumMax={setSearchParameterShotnumMax}
        />
      </Grid>
      <Grid item xs={1}>
        <Button
          variant="outlined"
          sx={{ height: '100%' }}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
