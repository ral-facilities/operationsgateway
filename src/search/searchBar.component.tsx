import React from 'react';
import DateTime from './components/dateTime.component';
import Timeframe from './components/timeframe.component';
import Experiment from './components/experiment.component';
import ShotNumber from './components/shotNumber.component';
import { Grid, Button, Collapse } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { DateRange, ShotnumRange } from '../app.types';
import { format } from 'date-fns';
import {
  changeSearchParams,
  selectSearchParams,
} from '../state/slices/searchSlice';

interface SearchBarProps {
  expanded: boolean;
}

const SearchBar = (props: SearchBarProps): React.ReactElement => {
  const dispatch = useAppDispatch();

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

  const handleSearch = React.useCallback(() => {
    const newDateRange: DateRange = {
      fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd HH:mm:ss') : undefined,
      toDate: toDate ? format(toDate, 'yyyy-MM-dd HH:mm:ss') : undefined,
    };

    const newShotnumRange: ShotnumRange = {
      min: shotnumMin,
      max: shotnumMax,
    };

    dispatch(
      changeSearchParams({
        dateRange: newDateRange,
        shotnumRange: newShotnumRange,
      })
    );
  }, [dispatch, fromDate, shotnumMax, shotnumMin, toDate]);

  const { expanded } = props;

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
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
    </Collapse>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
