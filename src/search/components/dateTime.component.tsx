import React from 'react';
import { isValid, isEqual, isBefore } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, Divider, Typography, Box } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { CalendarMonth } from '@mui/icons-material';

export const datesEqual = (date1: Date | null, date2: Date | null): boolean => {
  if (date1 === date2) {
    return true;
  } else if (!isValid(date1) && !isValid(date2)) {
    return true;
  }
  return date1 !== null && date2 !== null && isEqual(date1, date2);
};

export interface UpdateFilterParams {
  date: Date | null;
  prevDate: Date | null;
  otherDate: Date | null;
  fromDateOrToDateChanged: 'fromDate' | 'toDate';
  changeDate: (date: Date | null) => void;
}

export function updateFilter({
  date,
  prevDate,
  otherDate,
  fromDateOrToDateChanged,
  changeDate,
}: UpdateFilterParams): void {
  if (
    date &&
    isValid(date) &&
    !datesEqual(date, otherDate) &&
    (!prevDate || !datesEqual(date, prevDate))
  ) {
    const validFromDate =
      fromDateOrToDateChanged === 'fromDate' &&
      (!otherDate || isBefore(date, otherDate));
    const validToDate =
      fromDateOrToDateChanged === 'toDate' &&
      (!otherDate || !isBefore(date, otherDate));

    if (validFromDate || validToDate) changeDate(date);
  } else if (!date) {
    changeDate(null);
  }
}

export interface DateTimeSearchProps {
  fromDate: Date | null;
  toDate: Date | null;
  changeFromDate: (fromDate: Date | null) => void;
  changeToDate: (toDate: Date | null) => void;
  resetTimeframe: () => void;
}

const DateTimeSearch = (props: DateTimeSearchProps): React.ReactElement => {
  const { fromDate, toDate, changeFromDate, changeToDate, resetTimeframe } =
    props;

  const [popupOpen, setPopupOpen] = React.useState<boolean>(false);

  const invalidDateRange = fromDate && toDate && isBefore(toDate, fromDate);

  return (
    <Box
      sx={{
        border: '1.5px solid',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <CalendarMonth sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <form style={{ display: 'inline-grid', padding: 3 }}>
          <Typography>From date</Typography>
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm:ss"
            mask="____-__-__ __:__:__"
            value={fromDate}
            maxDateTime={toDate || new Date('2100-01-01 00:00:00')}
            componentsProps={{
              actionBar: { actions: ['clear'] },
            }}
            onChange={(date) => {
              resetTimeframe();
              if (!popupOpen) {
                updateFilter({
                  date: date as Date,
                  prevDate: fromDate,
                  otherDate: toDate,
                  fromDateOrToDateChanged: 'fromDate',
                  changeDate: changeFromDate,
                });
              }
            }}
            onAccept={(date) => {
              resetTimeframe();
              updateFilter({
                date: date as Date,
                prevDate: fromDate,
                otherDate: toDate,
                fromDateOrToDateChanged: 'fromDate',
                changeDate: changeFromDate,
              });
            }}
            onOpen={() => setPopupOpen(true)}
            onClose={() => setPopupOpen(false)}
            views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': 'from, date-time picker',
            }}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error || invalidDateRange) ?? undefined;
              let helperText = 'Date-time format: yyyy-MM-dd HH:mm:ss';
              if (invalidDateRange) helperText = 'Invalid date-time range';

              return (
                <TextField
                  {...renderProps}
                  id="from date-time"
                  inputProps={{
                    ...renderProps.inputProps,
                    placeholder: 'From...',
                    'aria-label': 'from, date-time input',
                    sx: {
                      fontSize: 12,
                    },
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
        </form>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ margin: 1, borderBottomWidth: 5 }}
        />
        <form style={{ display: 'inline-grid', padding: 3 }}>
          <Typography>To date</Typography>
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm:ss"
            mask="____-__-__ __:__:__"
            value={toDate}
            minDateTime={fromDate || new Date('1984-01-01 00:00:00')}
            componentsProps={{
              actionBar: { actions: ['clear'] },
            }}
            onChange={(date) => {
              resetTimeframe();
              if (!popupOpen) {
                updateFilter({
                  date: date as Date,
                  prevDate: toDate,
                  otherDate: fromDate,
                  fromDateOrToDateChanged: 'toDate',
                  changeDate: changeToDate,
                });
              }
            }}
            onAccept={(date) => {
              resetTimeframe();
              updateFilter({
                date: date as Date,
                prevDate: toDate,
                otherDate: fromDate,
                fromDateOrToDateChanged: 'toDate',
                changeDate: changeToDate,
              });
            }}
            onOpen={() => setPopupOpen(true)}
            onClose={() => setPopupOpen(false)}
            views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': 'to, date-time picker',
            }}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error || invalidDateRange) ?? undefined;
              let helperText = 'Date-time format: yyyy-MM-dd HH:mm:ss';
              if (invalidDateRange) helperText = 'Invalid date-time range';

              return (
                <TextField
                  {...renderProps}
                  id="to date-time"
                  inputProps={{
                    ...renderProps.inputProps,
                    placeholder: 'To...',
                    'aria-label': 'to, date-time input',
                    sx: {
                      fontSize: 12,
                    },
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
        </form>
      </LocalizationProvider>
    </Box>
  );
};

DateTimeSearch.displayName = 'DateTimeSearch';

export default DateTimeSearch;
