import { Warning } from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { isBefore, sub } from 'date-fns';
import React from 'react';
import { useExperiment } from '../api/experiment';
import {
  useDateToShotnumConverter,
  useIncomingRecordCount,
  useShotnumToDateConverter,
} from '../api/records';
import {
  DateRange,
  ExperimentParams,
  SearchParams,
  ShotnumRange,
} from '../app.types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectRecordLimitWarning } from '../state/slices/configSlice';
import { selectQueryFilters } from '../state/slices/filterSlice';
import {
  changeSearchParams,
  formatDateTimeForApi,
  selectSearchParams,
} from '../state/slices/searchSlice';
import AutoRefreshToggle from './components/autoRefreshToggle.component';
import DataRefresh from './components/dataRefresh.component';
import DateTime from './components/dateTime.component';
import Experiment from './components/experiment.component';
import MaxShots, { MAX_SHOTS_VALUES } from './components/maxShots.component';
import ShotNumber from './components/shotNumber.component';
import Timeframe, {
  type TimeframeRange,
} from './components/timeframe.component';

export type TimeframeDates = {
  fromDate: Date | null;
  toDate: Date | null;
};

interface SearchBarProps {
  expanded: boolean;
  sessionId: string | undefined;
  heightRef: (container: HTMLDivElement) => void;
}

const SearchBar = (props: SearchBarProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { expanded, sessionId, heightRef } = props;

  const searchParams = useAppSelector(selectSearchParams); // the parameters sent to the search query itself
  const {
    dateRange,
    shotnumRange,
    maxShots: maxShotsParam,
    experimentID,
  } = searchParams;

  // we need filters so we can check for past queries before showing the warning message
  const filters = useAppSelector(selectQueryFilters);

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

  // set seconds to 0 for searchParameterFromDate
  if (searchParameterFromDate) {
    searchParameterFromDate.setSeconds(0);
  }

  // set seconds to 59 for searchParameterToDate
  if (searchParameterToDate) {
    searchParameterToDate.setSeconds(59);
  }

  const setDateRange = React.useCallback(
    (fromDate: Date | null, toDate: Date | null) => {
      setSearchParameterFromDate(fromDate);
      setSearchParameterToDate(toDate);
    },
    []
  );

  // ########################
  // TIMEFRAME
  // ########################
  // Timeframe range is NOT sent as part of query
  // Instead, we use this to determine the FROM and TO dates
  // This is set in the timeframe search box by the user
  // If the user edits any of the date fields otherwise, this is set to null
  const [timeframeRange, setTimeframeRange] =
    React.useState<TimeframeRange | null>({ value: 24, timescale: 'hours' });

  const calculateTimeframeDateRange = (
    timeframe: TimeframeRange
  ): { from: Date; to: Date } => {
    const to = new Date();
    to.setSeconds(59);
    const from = sub(new Date(to), { [timeframe.timescale]: timeframe.value });
    from.setSeconds(0);

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

  const setShotnumberRange = React.useCallback(
    (shotnumMin: number | undefined, shotnumMax: number | undefined) => {
      setSearchParameterShotnumMin(shotnumMin);
      setSearchParameterShotnumMax(shotnumMax);
    },
    []
  );

  const [maxShots, setMaxShots] =
    React.useState<SearchParams['maxShots']>(maxShotsParam);

  // ########################
  // Experiment ID
  // ########################

  const { data: experiments } = useExperiment();
  const [searchParameterExperiment, setSearchParameterExperiment] =
    React.useState<ExperimentParams | null>(experimentID);

  const calculateExperimentDateRange = (
    experiment: ExperimentParams
  ): { from: Date; to: Date } => {
    const to = new Date(experiment.end_date);
    const from = new Date(experiment.start_date);

    return { from, to };
  };

  const setExperimentTimeframe = React.useCallback(
    (experiment: ExperimentParams | null) => {
      if (experiment == null) {
        setSearchParameterExperiment(null);
        return;
      }
      const { from, to } = calculateExperimentDateRange(experiment);
      setSearchParameterExperiment(experiment);
      setSearchParameterFromDate(from);
      setSearchParameterToDate(to);
    },
    []
  );

  const isDateTimeInExperiment = (
    dateTime: Date,
    experiment: ExperimentParams
  ): boolean => {
    const startDate = new Date(experiment.start_date);
    const endDate = new Date(experiment.end_date);
    return dateTime >= startDate && dateTime <= endDate;
  };

  // ##################################################
  // Check for vaild Date Ranges and Shot Number Ranges
  // ##################################################

  // need this to help keep track of invalid date ranges in the datetime component itself
  const [datePickerError, setDatePickerError] = React.useState(false);

  const invalidDateRange =
    (searchParameterFromDate !== null &&
      searchParameterToDate !== null &&
      searchParameterFromDate &&
      searchParameterToDate &&
      isBefore(searchParameterToDate, searchParameterFromDate)) ||
    (!searchParameterFromDate && searchParameterToDate !== null) ||
    (searchParameterFromDate !== null && !searchParameterToDate) ||
    datePickerError;

  const invalidShotNumberRange =
    (searchParameterShotnumMin !== undefined &&
      searchParameterShotnumMax !== undefined &&
      searchParameterShotnumMin > searchParameterShotnumMax) ||
    (searchParameterShotnumMin === undefined &&
      searchParameterShotnumMax !== undefined) ||
    (searchParameterShotnumMin !== undefined &&
      searchParameterShotnumMax === undefined);

  // Date range to shot number range converter
  const { data: dateToShotnum } = useDateToShotnumConverter(
    searchParameterFromDate
      ? formatDateTimeForApi(searchParameterFromDate)
      : undefined,
    searchParameterToDate
      ? formatDateTimeForApi(searchParameterToDate)
      : undefined,
    // only enable query when dates are not null and the range is valid
    !invalidDateRange &&
      !(searchParameterFromDate === null && searchParameterToDate === null)
  );

  // Shot number range to date range converter
  const { data: shotnumToDate } = useShotnumToDateConverter(
    searchParameterShotnumMin,
    searchParameterShotnumMax,
    // only enable query when shot numbers are not undefined and the range is valid
    !invalidShotNumberRange &&
      !(
        typeof searchParameterShotnumMin === 'undefined' &&
        typeof searchParameterShotnumMax === 'undefined'
      )
  );

  // Checks for changes to shot number range and date range
  // This is for the animation in date time box and shotnum box

  const [isShotnumToDate, setIsShotnumToDate] = React.useState<boolean>(false);
  const [isDateToShotnum, setIsDateToShotnum] = React.useState<boolean>(false);

  // handles the date range to shot number conversion
  React.useEffect(() => {
    setIsShotnumToDate(!dateToShotnum && !!shotnumToDate);
    setIsDateToShotnum(!!dateToShotnum && !shotnumToDate);
    // Sets the date range when the shot number range is selected.
    // Additionally if the new shot number range is not within
    // the current experiment id time frame it clears the experiment id
    // and if a time frame range exist it clears the time frame range
    if (!dateToShotnum && !!shotnumToDate) {
      if (shotnumToDate.from && shotnumToDate.to) {
        const shotnumToDateFromDate = new Date(shotnumToDate.from);
        const shotnumToDateToDate = new Date(shotnumToDate.to);
        setSearchParameterFromDate(shotnumToDateFromDate);
        setSearchParameterToDate(shotnumToDateToDate);
        if (timeframeRange) {
          setTimeframeRange(null);
        }
        if (searchParameterExperiment) {
          if (
            !(
              isDateTimeInExperiment(
                shotnumToDateFromDate,
                searchParameterExperiment
              ) &&
              isDateTimeInExperiment(
                shotnumToDateToDate,
                searchParameterExperiment
              )
            )
          ) {
            setExperimentTimeframe(null);
          }
        }
      }
      // Sets the shot number range when the date Range is selected.
      // the logic for the timeframes and experiment timeframe is done
      // in the dateTime component
    } else if (!!dateToShotnum && !shotnumToDate) {
      setSearchParameterShotnumMin(dateToShotnum.min);
      setSearchParameterShotnumMax(dateToShotnum.max);
    }
  }, [
    dateToShotnum,
    searchParameterExperiment,
    setExperimentTimeframe,
    shotnumToDate,
    timeframeRange,
  ]);

  // Updates the search fields when a session is loaded
  // also just generally ensures we're synced with the store
  React.useEffect(() => {
    setSearchParameterFromDate(
      typeof dateRange.fromDate !== 'undefined'
        ? new Date(dateRange.fromDate)
        : null
    );
    setSearchParameterToDate(
      typeof dateRange.toDate !== 'undefined'
        ? new Date(dateRange.toDate)
        : null
    );

    setSearchParameterExperiment(experimentID);

    setSearchParameterShotnumMin(shotnumRange.min);
    setSearchParameterShotnumMax(shotnumRange.max);

    setMaxShots(maxShotsParam);
    setParamsUpdated(false);
  }, [
    dateRange.fromDate,
    dateRange.toDate,
    experimentID,
    maxShotsParam,
    shotnumRange.max,
    shotnumRange.min,
  ]);

  const firstUpdate = React.useRef(true);
  // use a ref so that we can control the useEffect that's supposed to
  // only activate after handleSearch is clicked & incomingCount is updated
  const currentlySearching = React.useRef(false);

  // removes all the search fields when a session is loaded
  React.useEffect(() => {
    if (!firstUpdate.current && sessionId) {
      setSearchParameterExperiment(null);
      setSearchParameterFromDate(null);
      setSearchParameterToDate(null);
      setSearchParameterShotnumMin(undefined);
      setSearchParameterShotnumMax(undefined);
      setMaxShots(MAX_SHOTS_VALUES[0]);
      setTimeframeRange(null);
    } else firstUpdate.current = false;
  }, [sessionId]);

  const searchParamsUpdated = () => {
    setParamsUpdated(true);
    // reset warning message when search params change
    setDisplayingWarningMessage(false);
  };

  // ########################
  // RECORD LIMIT WARNING
  // ########################
  // The limit on how many records are fetched before displaying a warning to the user
  const recordLimitWarning = useAppSelector(selectRecordLimitWarning);

  const [displayingWarningMessage, setDisplayingWarningMessage] =
    React.useState<boolean>(false);

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

  const queryClient = useQueryClient();

  const overRecordLimit = React.useCallback((): boolean => {
    return (
      !countLoading &&
      incomingCount !== undefined &&
      recordLimitWarning > -1 &&
      maxShots > recordLimitWarning &&
      incomingCount > recordLimitWarning
    );
  }, [countLoading, incomingCount, recordLimitWarning, maxShots]);

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

    const newSearchParams: SearchParams = {
      dateRange: newDateRange,
      shotnumRange: newShotnumRange,
      maxShots,
      experimentID: searchParameterExperiment,
    };

    setIncomingParams(newSearchParams);

    // if the user re-clicks the button after the warning message is displayed
    // or if the user has already fetched the data they're requesting
    // update the applied filters
    if (
      displayingWarningMessage ||
      // search for if we have previously made a search with these params
      // use exact: false to ignore things like sort, pagination etc.
      queryClient.getQueriesData({
        exact: false,
        queryKey: [
          'records',
          { filters: filters, searchParams: newSearchParams },
        ],
      }).length > 0
    ) {
      setDisplayingWarningMessage(false);
      dispatch(changeSearchParams(newSearchParams));
      setParamsUpdated(false);
      currentlySearching.current = false;
    } else {
      currentlySearching.current = true;
    }
  }, [
    searchParameterFromDate,
    searchParameterToDate,
    searchParameterShotnumMin,
    searchParameterShotnumMax,
    searchParameterExperiment,
    maxShots,
    displayingWarningMessage,
    queryClient,
    filters,
    dispatch,
  ]);

  // this should run after handleSearch is called and incomingCount
  // is subsequently updated - here we check if we're over the record limit and either
  // display the warning message or update the applied filters
  React.useEffect(() => {
    // check incomingCount isn't undefined so we don't run on initial render
    // also check we're currently searching i.e. only run directly after handleSearch is called
    // not in other instances where incomingCount/incomingSearch can change
    if (typeof incomingCount !== 'undefined' && currentlySearching.current) {
      if (
        !displayingWarningMessage &&
        overRecordLimit() &&
        // search for if we have previously made a search with these params
        // use exact: false to ignore things like sort, pagination etc.
        queryClient.getQueriesData({
          exact: false,
          queryKey: [
            'records',
            { filters: filters, searchParams: incomingParams },
          ],
        }).length === 0
      ) {
        setDisplayingWarningMessage(true);
      } else {
        setDisplayingWarningMessage(false);
        dispatch(changeSearchParams(incomingParams));
        setParamsUpdated(false);
        currentlySearching.current = false;
      }
    }
    // deliberately only want this use effect to be called when incomingCount or incomingParams changes
    // i.e. so we can react to the result of new incoming count queries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCount, incomingParams]);

  const [refreshingData, setRefreshingData] = React.useState<boolean>(false);

  const refreshData = () => {
    setExperimentTimeframe(searchParameterExperiment);
    setRelativeTimeframe(timeframeRange);
    setRefreshingData(true);
  };

  React.useEffect(() => {
    if (refreshingData) {
      handleSearch();
      setRefreshingData(false);
    }
  }, [handleSearch, refreshingData]);

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Grid container spacing={1} direction="row" ref={heightRef}>
        <Grid container item xs={12} direction="column">
          <Grid item>
            <Grid container spacing={0.5} direction="row">
              <Grid item xs xl="auto">
                <DateTime
                  searchParameterFromDate={searchParameterFromDate}
                  searchParameterToDate={searchParameterToDate}
                  changeSearchParameterFromDate={setSearchParameterFromDate}
                  changeSearchParameterToDate={setSearchParameterToDate}
                  resetTimeframe={() => setRelativeTimeframe(null)}
                  timeframeRange={timeframeRange}
                  resetExperimentTimeframe={() => setExperimentTimeframe(null)}
                  searchParameterExperiment={searchParameterExperiment}
                  experiments={experiments ?? []}
                  resetShotnumberRange={() =>
                    setShotnumberRange(undefined, undefined)
                  }
                  isShotnumToDate={isShotnumToDate}
                  isDateTimeInExperiment={isDateTimeInExperiment}
                  invalidDateRange={invalidDateRange}
                  searchParamsUpdated={searchParamsUpdated}
                  setDatePickerError={setDatePickerError}
                />
              </Grid>
              <Grid item xs="auto">
                <Timeframe
                  timeframe={timeframeRange}
                  changeTimeframe={setRelativeTimeframe}
                  resetExperimentTimeframe={() => setExperimentTimeframe(null)}
                  resetShotnumber={() =>
                    setShotnumberRange(undefined, undefined)
                  }
                  searchParamsUpdated={searchParamsUpdated}
                />
              </Grid>
              <Grid item xs xl="auto">
                <Experiment
                  experiments={experiments ?? []}
                  onExperimentChange={setSearchParameterExperiment}
                  experiment={searchParameterExperiment}
                  resetTimeframe={() => setRelativeTimeframe(null)}
                  changeExperimentTimeframe={setExperimentTimeframe}
                  resetShotnumber={() =>
                    setShotnumberRange(undefined, undefined)
                  }
                  searchParamsUpdated={searchParamsUpdated}
                />
              </Grid>
              <Grid item xs xl="auto">
                <ShotNumber
                  searchParameterShotnumMin={searchParameterShotnumMin}
                  searchParameterShotnumMax={searchParameterShotnumMax}
                  changeSearchParameterShotnumMin={setSearchParameterShotnumMin}
                  changeSearchParameterShotnumMax={setSearchParameterShotnumMax}
                  resetDateRange={() => setDateRange(null, null)}
                  resetExperimentTimeframe={() => setExperimentTimeframe(null)}
                  isDateToShotnum={isDateToShotnum}
                  invalidShotNumberRange={invalidShotNumberRange}
                  searchParamsUpdated={searchParamsUpdated}
                />
              </Grid>
              <Grid item xs="auto">
                {displayingWarningMessage ? (
                  <Tooltip
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: 'yellow',
                          color: 'black',
                          border: '1px solid black',
                        },
                      },
                    }}
                    data-testid="results-tooltip"
                    arrow
                    placement="bottom"
                    enterDelay={0}
                    enterTouchDelay={0}
                    title={
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                      >
                        <Warning
                          sx={{ fontSize: 25, padding: '10px 5px 5px 0px' }}
                        />
                        <div>
                          <Typography variant="caption" align="center">
                            {`This search will return over ${recordLimitWarning}
                      results.`}
                          </Typography>
                          <br />
                          <Typography variant="caption" align="center">
                            Click Search again to continue
                          </Typography>
                        </div>
                      </Box>
                    }
                  >
                    <span>
                      <Button
                        variant={paramsUpdated ? 'contained' : 'outlined'}
                        sx={{ height: '100%', paddingLeft: 1, paddingRight: 1 }}
                        onClick={handleSearch}
                        disabled={invalidDateRange || invalidShotNumberRange}
                      >
                        Search
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Button
                    variant={paramsUpdated ? 'contained' : 'outlined'}
                    sx={{ height: '100%', paddingLeft: 1, paddingRight: 1 }}
                    onClick={handleSearch}
                    disabled={invalidDateRange || invalidShotNumberRange}
                  >
                    Search
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction="row" columnGap={5}>
            <Grid item>
              <MaxShots
                maxShots={maxShots}
                changeMaxShots={setMaxShots}
                searchParamsUpdated={searchParamsUpdated}
              />
            </Grid>
            <Grid item>
              <DataRefresh
                timeframeSet={!!timeframeRange}
                refreshData={refreshData}
              />
            </Grid>
            <Grid item>
              <AutoRefreshToggle
                enabled={Boolean(timeframeRange)}
                onRequestRefresh={refreshData}
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
