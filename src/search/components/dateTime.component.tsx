import React from 'react';
import { isValid, isEqual, isBefore, isAfter } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, Divider, Typography, Box, Grid } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { CalendarMonth } from '@mui/icons-material';
import { TimeframeRange } from './timeframe.component';
import { FLASH_ANIMATION } from '../../animation';
import { ExperimentParams } from '../../app.types';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { styled } from '@mui/material/styles';

export const datesEqual = (date1: Date | null, date2: Date | null): boolean => {
  if (date1 === date2) {
    return true;
  } else if (!isValid(date1) && !isValid(date2)) {
    return true;
  }
  return date1 !== null && date2 !== null && isEqual(date1, date2);
};

interface CustomPickerDayProps extends PickersDayProps<Date> {
  dayIsBetween: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
}

export const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay',
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay }) => ({
  ...(dayIsBetween && {
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(isFirstDay && {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  }),
  ...(isLastDay && {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  }),
})) as React.ComponentType<CustomPickerDayProps>;

export const renderExperimentPickerDay = (
  selectedDate: Date | null,
  experiments: ExperimentParams[],
  isDateTimeInExperiment: (
    dateTime: Date,
    experiment: ExperimentParams
  ) => boolean,
  date: Date,
  selectedDates: Array<Date | null>,
  pickersDayProps: PickersDayProps<Date>
): React.ReactElement => {
  if (!selectedDate) {
    return <PickersDay {...pickersDayProps} />;
  }

  selectedDate.setSeconds(0);

  const experimentRange = experiments.find((experiment) =>
    isDateTimeInExperiment(selectedDate, experiment)
  );

  if (!experimentRange) {
    return <PickersDay {...pickersDayProps} />;
  }

  const start = new Date(experimentRange.start_date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(experimentRange.end_date);
  const currentDate = new Date(date);
  const dayIsBetween = date >= start && date <= end;
  const isFirstDay = currentDate.getDate() === start.getDate();
  const isLastDay = currentDate.getDate() === end.getDate();

  return (
    <CustomPickersDay
      {...pickersDayProps}
      disableMargin
      dayIsBetween={dayIsBetween}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
    />
  );
};

export interface VerifyAndUpdateDateParams {
  date: Date | null;
  prevDate: Date | null;
  otherDate: Date | null;
  fromDateOrToDateChanged: 'fromDate' | 'toDate';
  changeDate: (date: Date | null) => void;
}

export function verifyAndUpdateDate({
  date,
  prevDate,
  otherDate,
  fromDateOrToDateChanged,
  changeDate,
}: VerifyAndUpdateDateParams): void {
  if (date && isValid(date) && (!prevDate || !datesEqual(date, prevDate))) {
    const validFromDate =
      fromDateOrToDateChanged === 'fromDate' &&
      (!otherDate || !isAfter(date, otherDate));
    const validToDate =
      fromDateOrToDateChanged === 'toDate' &&
      (!otherDate || !isBefore(date, otherDate));

    if (validFromDate || validToDate) changeDate(date);
  } else if (!date) {
    changeDate(null);
  }
}

export interface DateTimeSearchProps {
  searchParameterFromDate: Date | null;
  searchParameterToDate: Date | null;
  changeSearchParameterFromDate: (fromDate: Date | null) => void;
  changeSearchParameterToDate: (toDate: Date | null) => void;
  resetTimeframe: () => void;
  timeframeRange: TimeframeRange | null;
  resetExperimentTimeframe: () => void;
  searchParameterExperiment: ExperimentParams | null;
  experiments: ExperimentParams[];
  resetShotnumberRange: () => void;
  isShotnumToDate: boolean;
  isDateTimeInExperiment: (
    dateTime: Date,
    experiment: ExperimentParams
  ) => boolean;
  invalidDateRange: boolean;
  searchParamsUpdated: () => void;
}

/**
 * The date-time fields are determined through the following variables:
 *
 * searchParameter(From/To)Date
 * These dates are the global source of truth and live in the searchBar state
 * Whatever is in these fields is what populates the search query
 *
 * datePicker(From/To)Date
 * These dates are what currently fills the values of the date-time pickers
 * They live in the DateTimeSearch state
 * Whenever they represent a valid date, they update the searchParameter(From/To)Date variable
 * This is done in the verifyAndUpdateDate function in this file
 *
 * timeframeRange
 * This contains a user-selected timeframe range value, if it is set by the timeframe component
 * If this is updated in that component, it updates the searchParameter(From/To)Dates
 * Thanks to a useEffect hook in the DateTimeSearch component, this then updates the datePicker(From/To)Dates
 */
const DateTimeSearch = (props: DateTimeSearchProps): React.ReactElement => {
  const {
    searchParameterFromDate,
    searchParameterToDate,
    changeSearchParameterFromDate,
    changeSearchParameterToDate,
    resetTimeframe,
    timeframeRange,
    resetExperimentTimeframe,
    searchParameterExperiment,
    experiments,
    resetShotnumberRange,
    isShotnumToDate,
    isDateTimeInExperiment,
    invalidDateRange,
    searchParamsUpdated,
  } = props;

  const [datePickerFromDate, setDatePickerFromDate] =
    React.useState<Date | null>(searchParameterFromDate);
  const [datePickerToDate, setDatePickerToDate] = React.useState<Date | null>(
    searchParameterToDate
  );

  React.useEffect(() => {
    setDatePickerFromDate(searchParameterFromDate);
    setDatePickerToDate(searchParameterToDate);
  }, [searchParameterFromDate, searchParameterToDate]);

  const [datePickerFromDateError, setDatePickerFromDateError] =
    React.useState<boolean>(false);
  const [datePickerToDateError, setDatePickerToDateError] =
    React.useState<boolean>(false);

  const [popupOpen, setPopupOpen] = React.useState<boolean>(false);

  const [flashAnimationPlaying, setFlashAnimationPlaying] =
    React.useState<boolean>(false);

  // clear any old animation and start new animation
  // (use setTimeout 0 to make it happen on next browser cycle - needed to restart animation)
  // this uses different method to others as the datetime can be quickly changed via the timeframe component
  React.useLayoutEffect(() => {
    if (
      !!timeframeRange ||
      (!!searchParameterExperiment && !isShotnumToDate) ||
      (isShotnumToDate && !searchParameterExperiment)
    ) {
      setFlashAnimationPlaying(false);
      setTimeout(() => {
        setFlashAnimationPlaying(true);
      }, 0);
    }
  }, [timeframeRange, searchParameterExperiment, isShotnumToDate]);

  return (
    <Box
      aria-label="date-time search box"
      sx={{
        border: '1.5px solid',
        borderColor:
          datePickerFromDateError || datePickerToDateError || invalidDateRange
            ? 'rgb(214, 65, 65)'
            : undefined,
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        ...(flashAnimationPlaying && {
          animation: `${FLASH_ANIMATION.animation} ${FLASH_ANIMATION.length}ms`,
        }),
      }}
    >
      <CalendarMonth sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container columns={2} direction="column">
          <Grid item>
            <Typography noWrap>From date</Typography>
          </Grid>
          <Grid item>
            <DateTimePicker
              inputFormat="yyyy-MM-dd HH:mm"
              mask="____-__-__ __:__"
              value={datePickerFromDate}
              maxDateTime={datePickerToDate || new Date('2100-01-01 00:00:00')}
              componentsProps={{
                actionBar: { actions: ['clear'] },
              }}
              onChange={(date) => {
                setDatePickerFromDate(date);
                resetTimeframe();
                searchParamsUpdated();

                resetShotnumberRange();

                if (searchParameterExperiment && date) {
                  if (
                    !isDateTimeInExperiment(date, searchParameterExperiment)
                  ) {
                    resetExperimentTimeframe();
                  }
                }

                if (!popupOpen) {
                  verifyAndUpdateDate({
                    date: date,
                    prevDate: searchParameterFromDate,
                    otherDate: datePickerToDate,
                    fromDateOrToDateChanged: 'fromDate',
                    changeDate: changeSearchParameterFromDate,
                  });
                }
              }}
              onAccept={(date) => {
                setDatePickerFromDate(date);
                resetTimeframe();
                searchParamsUpdated();
                resetShotnumberRange();
                if (searchParameterExperiment && date) {
                  if (
                    !isDateTimeInExperiment(date, searchParameterExperiment)
                  ) {
                    resetExperimentTimeframe();
                  }
                }
                verifyAndUpdateDate({
                  date: date,
                  prevDate: searchParameterFromDate,
                  otherDate: datePickerToDate,
                  fromDateOrToDateChanged: 'fromDate',
                  changeDate: changeSearchParameterFromDate,
                });
              }}
              onOpen={() => setPopupOpen(true)}
              onClose={() => setPopupOpen(false)}
              onError={(error) => setDatePickerFromDateError(!!error)}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              OpenPickerButtonProps={{
                size: 'small',
                'aria-label': 'from, date-time picker',
              }}
              renderDay={(date, selectedDates, pickersDayProps) =>
                renderExperimentPickerDay(
                  datePickerToDate,
                  experiments,
                  isDateTimeInExperiment,
                  date,
                  selectedDates,
                  pickersDayProps
                )
              }
              renderInput={(renderProps) => {
                const error =
                  (renderProps.error || invalidDateRange) ?? undefined;
                let helperText = 'Date-time format: yyyy-MM-dd HH:mm';
                if (invalidDateRange) helperText = 'Invalid date-time range';

                return (
                  <TextField
                    {...renderProps}
                    fullWidth
                    id="from date-time"
                    inputProps={{
                      ...renderProps.inputProps,
                      placeholder: 'From...',
                      'aria-label': 'from, date-time input',
                      sx: {
                        fontSize: '1rem',
                        fontWeight: 'bold',
                      },
                    }}
                    variant="standard"
                    error={error}
                    {...(error && { helperText: helperText })}
                  />
                );
              }}
            />
          </Grid>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ margin: 1, borderBottomWidth: 5 }}
        />
        <Grid container columns={2} direction="column">
          <Grid item>
            <Typography noWrap>To date</Typography>
          </Grid>
          <Grid item>
            <DateTimePicker
              inputFormat="yyyy-MM-dd HH:mm"
              mask="____-__-__ __:__"
              value={datePickerToDate}
              minDateTime={
                datePickerFromDate || new Date('1984-01-01 00:00:00')
              }
              componentsProps={{
                actionBar: { actions: ['clear', 'today'] },
              }}
              onChange={(date) => {
                setDatePickerToDate(date as Date);
                resetTimeframe();
                searchParamsUpdated();
                resetShotnumberRange();
                if (searchParameterExperiment && date) {
                  if (
                    !isDateTimeInExperiment(date, searchParameterExperiment)
                  ) {
                    resetExperimentTimeframe();
                  }
                }
                if (!popupOpen) {
                  verifyAndUpdateDate({
                    date: date as Date,
                    prevDate: searchParameterToDate,
                    otherDate: datePickerFromDate,
                    fromDateOrToDateChanged: 'toDate',
                    changeDate: changeSearchParameterToDate,
                  });
                }
              }}
              onAccept={(date) => {
                setDatePickerToDate(date as Date);
                resetTimeframe();
                searchParamsUpdated();
                resetShotnumberRange();
                if (searchParameterExperiment && date) {
                  if (
                    !isDateTimeInExperiment(date, searchParameterExperiment)
                  ) {
                    resetExperimentTimeframe();
                  }
                }
                verifyAndUpdateDate({
                  date: date as Date,
                  prevDate: searchParameterToDate,
                  otherDate: datePickerFromDate,
                  fromDateOrToDateChanged: 'toDate',
                  changeDate: changeSearchParameterToDate,
                });
              }}
              onOpen={() => setPopupOpen(true)}
              onClose={() => setPopupOpen(false)}
              onError={(error) => setDatePickerToDateError(!!error)}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              OpenPickerButtonProps={{
                size: 'small',
                'aria-label': 'to, date-time picker',
              }}
              renderDay={(date, selectedDates, pickersDayProps) =>
                renderExperimentPickerDay(
                  datePickerFromDate,
                  experiments,
                  isDateTimeInExperiment,
                  date,
                  selectedDates,
                  pickersDayProps
                )
              }
              renderInput={(renderProps) => {
                const error =
                  (renderProps.error || invalidDateRange) ?? undefined;
                let helperText = 'Date-time format: yyyy-MM-dd HH:mm';
                if (invalidDateRange) helperText = 'Invalid date-time range';

                return (
                  <TextField
                    {...renderProps}
                    fullWidth
                    id="to date-time"
                    inputProps={{
                      ...renderProps.inputProps,
                      placeholder: 'To...',
                      'aria-label': 'to, date-time input',
                      sx: {
                        fontSize: '1rem',
                        fontWeight: 'bold',
                      },
                    }}
                    variant="standard"
                    error={error}
                    {...(error && { helperText: helperText })}
                  />
                );
              }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  );
};

DateTimeSearch.displayName = 'DateTimeSearch';

export default DateTimeSearch;
