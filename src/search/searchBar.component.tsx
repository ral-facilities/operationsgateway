import React from 'react';
import DateTime from './components/dateTime.component';
import Timeframe, {
  type TimeframeRange,
} from './components/timeframe.component';
import Experiment from './components/experiment.component';
import ShotNumber from './components/shotNumber.component';
import MaxShots from './components/maxShots.component';
import DataRefresh from './components/dataRefresh.component';
import { Grid, Button, Collapse } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { DateRange, SearchParams, ShotnumRange } from '../app.types';
import { sub } from 'date-fns';
import {
  changeSearchParams,
  selectSearchParams,
  formatDateTimeForApi,
} from '../state/slices/searchSlice';

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
  const { dateRange, shotnumRange, maxShots: maxShotsParam } = searchParams;

  const [paramsUpdated, setParamsUpdated] = React.useState<boolean>(false);

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

  const [maxShots, setMaxShots] =
    React.useState<SearchParams['maxShots']>(maxShotsParam);

  React.useEffect(() => {
    setParamsUpdated(true);
  }, [
    searchParameterFromDate,
    searchParameterToDate,
    searchParameterShotnumMin,
    searchParameterShotnumMax,
    maxShots,
  ]);

  // ########################
  // INITIATING THE SEARCH
  // ########################
  const handleSearch = React.useCallback(() => {
    const newDateRange: DateRange = {
      fromDate: searchParameterFromDate
        ? formatDateTimeForApi(searchParameterFromDate)
        : undefined,
      toDate: searchParameterToDate
        ? formatDateTimeForApi(searchParameterToDate)
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
        maxShots,
      })
    );

    setParamsUpdated(false);
  }, [
    dispatch,
    searchParameterFromDate,
    maxShots,
    searchParameterShotnumMax,
    searchParameterShotnumMin,
    searchParameterToDate,
  ]);

  const [refreshingData, setRefreshingData] = React.useState<boolean>(false);

  const refreshData = () => {
    setRelativeTimeframe(timeframeRange);
    setRefreshingData(true);
  };

  React.useEffect(() => {
    if (refreshingData) {
      handleSearch();
      setRefreshingData(false);
    }
  }, [handleSearch, refreshingData]);

  const { expanded } = props;

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Grid container spacing={1} direction="row">
        <Grid container item xs={11} direction="column">
          <Grid item>
            <Grid container spacing={1} direction="row">
              <Grid item xs={5}>
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
                  variant={paramsUpdated ? 'contained' : 'outlined'}
                  sx={{ height: '100%' }}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction="row">
            <Grid item>
              <MaxShots maxShots={maxShots} changeMaxShots={setMaxShots} />
            </Grid>
            <Grid item>
              <DataRefresh
                timeframeSet={!!timeframeRange}
                refreshData={refreshData}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Collapse>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
