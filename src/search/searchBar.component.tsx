import React from 'react';
import DateTime from './components/dateTime.component';
import Timeframe from './components/timeframe.component';
import Experiment from './components/experiment.component';
import ShotNumber from './components/shotNumber.component';
import { Grid, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { DateRange, SearchParams, ShotnumRange } from '../app.types';
import { format } from 'date-fns';
import {
  changeSearchParams,
  selectSearchParams,
} from '../state/slices/searchSlice';
import { selectRecordLimitWarning } from '../state/slices/configSlice';
import { useIncomingRecordCount } from '../api/records';

const SearchBar = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const recordLimitWarning = useAppSelector(selectRecordLimitWarning);

  const searchParams = useAppSelector(selectSearchParams);
  const { dateRange, shotnumRange } = searchParams;

  const [fromDate, setFromDate] = React.useState<Date | null>(
    dateRange.fromDate ? new Date(dateRange.fromDate) : null
  );
  const [toDate, setToDate] = React.useState<Date | null>(
    dateRange.toDate ? new Date(dateRange.toDate) : null
  );

  const [shotnumMin, setShotnumMin] = React.useState<number | undefined>(
    shotnumRange.min ?? undefined
  );
  const [shotnumMax, setShotnumMax] = React.useState<number | undefined>(
    shotnumRange.max ?? undefined
  );

  const [incomingParams, setIncomingParams] =
    React.useState<SearchParams>(searchParams);

  const { data: incomingCount, isLoading: countLoading } =
    useIncomingRecordCount(incomingParams);

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

  const handleSearch = React.useCallback(() => {
    const newDateRange: DateRange = {
      fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd HH:mm:ss') : undefined,
      toDate: toDate ? format(toDate, 'yyyy-MM-dd HH:mm:ss') : undefined,
    };

    const newShotnumRange: ShotnumRange = {
      min: shotnumMin,
      max: shotnumMax,
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
    fromDate,
    shotnumMax,
    shotnumMin,
    toDate,
  ]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <DateTime
          receivedFromDate={fromDate}
          receivedToDate={toDate}
          changeFromDate={setFromDate}
          changeToDate={setToDate}
        />
      </Grid>
      <Grid item xs={2}>
        <Timeframe />
      </Grid>
      <Grid item xs={2}>
        <Experiment />
      </Grid>
      <Grid item xs={2}>
        <ShotNumber
          receivedMin={shotnumMin}
          receivedMax={shotnumMax}
          changeMin={setShotnumMin}
          changeMax={setShotnumMax}
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
