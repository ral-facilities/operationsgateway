import React from 'react';
import DateTime from './components/dateTime.component';
import Timeframe, {
  type TimeframeRange,
} from './components/timeframe.component';
import Experiment from './components/experiment.component';
import ShotNumber from './components/shotNumber.component';
import { Grid, Button, Collapse } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { DateRange, SearchParams, ShotnumRange } from '../app.types';
import { format, sub } from 'date-fns';
import {
  changeSearchParams,
  selectSearchParams,
} from '../state/slices/searchSlice';
import { selectRecordLimitWarning } from '../state/slices/configSlice';
import { useIncomingRecordCount } from '../api/records';

export type TimeframeDates = {
  fromDate: Date | null;
  toDate: Date | null;
};

interface SearchBarProps {
  expanded: boolean;
}

const SearchBar = (props: SearchBarProps): React.ReactElement => {
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
    const from = sub(new Date(to), { [timeframe.timescale]: timeframe.value });

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
  // RECORD LIMIT WARNING
  // ########################
  // The limit on how many records are fetched before displaying a warning to the user
  const recordLimitWarning = useAppSelector(selectRecordLimitWarning);

  // ########################
  // INCOMING PARAMETERS
  // ########################
  // Parameters initially used to fetch the count of records in the new search request
  // Ties in with record limit warning message to get the count of new records before actually retrieving them
  // Can be thought of as working search parameters before the user commits to searching by them
  const [incomingParams, setIncomingParams] =
    React.useState<SearchParams>(searchParams);

  const { data: incomingCount, isLoading: countLoading } =
    useIncomingRecordCount(undefined, incomingParams);

  const checkAndVerifyRecordLimit = React.useCallback((): boolean => {
    if (
      !countLoading &&
      incomingCount &&
      recordLimitWarning > -1 &&
      incomingCount > recordLimitWarning
    ) {
      return window.confirm(
        `This search will return over ${recordLimitWarning} results. Continue?`
      );
    }
    return true;
  }, [countLoading, incomingCount, recordLimitWarning]);

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

    const newSearchParams: SearchParams = {
      dateRange: newDateRange,
      shotnumRange: newShotnumRange,
    };

    setIncomingParams(newSearchParams);
    if (!checkAndVerifyRecordLimit()) return;

    dispatch(changeSearchParams(newSearchParams));
  }, [
    checkAndVerifyRecordLimit,
    dispatch,
    searchParameterFromDate,
    searchParameterShotnumMax,
    searchParameterShotnumMin,
    searchParameterToDate,
  ]);

  const { expanded } = props;

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
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
            sx={{ height: '54.6px' }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Collapse>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
