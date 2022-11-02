import React from 'react';
import { format, isValid, isEqual, isBefore } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, Divider, Typography, Box, Grid } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { changeDateRange } from '../state/slices/searchSlice';

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
  onChange: (value: { fromDate?: string; toDate?: string }) => void;
}

export function updateFilter({
  date,
  prevDate,
  otherDate,
  fromDateOrToDateChanged,
  onChange,
}: UpdateFilterParams): void {
  if (datesEqual(date, prevDate)) return; // Do nothing if the date is unchanged

  if (fromDateOrToDateChanged === 'fromDate') {
    if (date && otherDate && !isBefore(date, otherDate)) return; // Do nothing if fromDate is after toDate
    onChange({
      fromDate: date ? format(date, 'yyyy-MM-dd HH:mm:ss') : undefined,
      toDate: otherDate ? format(otherDate, 'yyyy-MM-dd HH:mm:ss') : undefined,
    });
  } else {
    if (date && otherDate && isBefore(date, otherDate)) return; // Do nothing if toDate is before fromDate
    onChange({
      fromDate: otherDate
        ? format(otherDate, 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      toDate: date ? format(date, 'yyyy-MM-dd HH:mm:ss') : undefined,
    });
  }
}

export interface DateTimeFilterProps {
  onChange: (value: { fromDate?: string; toDate?: string }) => void;
  value: { fromDate?: string; toDate?: string };
}

export const DateTimeFilter = (
  props: DateTimeFilterProps
): React.ReactElement => {
  const [fromDate, setFromDate] = React.useState<Date | null>(
    props.value?.fromDate ? new Date(props.value.fromDate) : null
  );
  const [toDate, setToDate] = React.useState<Date | null>(
    props.value?.toDate ? new Date(props.value.toDate) : null
  );

  const [popupOpen, setPopupOpen] = React.useState<boolean>(false);

  const invalidDateRange = fromDate && toDate && isBefore(toDate, fromDate);

  return (
    <Box
      sx={{
        border: 'solid',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container>
          <Typography>From date/time</Typography>
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm:ss"
            mask="____-__-__ __:__:__"
            value={fromDate}
            maxDateTime={toDate || new Date('2100-01-01 00:00:00')}
            componentsProps={{
              actionBar: { actions: ['clear', 'cancel', 'accept'] },
            }}
            // onChange handles user-input date-time changes
            onChange={(date) => {
              setFromDate(date as Date);
              if ((date == null || isValid(date as Date)) && !popupOpen) {
                updateFilter({
                  date: date as Date,
                  prevDate: fromDate,
                  otherDate: toDate,
                  fromDateOrToDateChanged: 'fromDate',
                  onChange: props.onChange,
                });
              }
            }}
            // onAccept handles changes made in the picker popup
            onAccept={(date) => {
              setPopupOpen(false);
              updateFilter({
                date: date as Date,
                prevDate: fromDate,
                otherDate: toDate,
                fromDateOrToDateChanged: 'fromDate',
                onChange: props.onChange,
              });
            }}
            onOpen={() => setPopupOpen(true)}
            onClose={() => {
              setPopupOpen(false);
              updateFilter({
                date: fromDate,
                prevDate: fromDate,
                otherDate: toDate,
                fromDateOrToDateChanged: 'fromDate',
                onChange: props.onChange,
              });
            }}
            views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': 'from, date-time picker',
            }}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error ||
                  invalidDateRange ||
                  (fromDate && !isValid(fromDate))) ??
                undefined;
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
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ margin: 2, borderBottomWidth: 5 }}
        />
        <Grid container>
          <Typography>To date/time</Typography>
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm:ss"
            mask="____-__-__ __:__:__"
            value={toDate}
            minDateTime={fromDate || new Date('1984-01-01 00:00:00')}
            componentsProps={{
              actionBar: { actions: ['clear', 'cancel', 'accept'] },
            }}
            // onChange handles user-input date-time changes
            onChange={(date) => {
              setToDate(date as Date);
              if ((date == null || isValid(date as Date)) && !popupOpen) {
                updateFilter({
                  date: date as Date,
                  prevDate: toDate,
                  otherDate: fromDate,
                  fromDateOrToDateChanged: 'toDate',
                  onChange: props.onChange,
                });
              }
            }}
            // onAccept handles changes made in the picker popup
            onAccept={(date) => {
              setPopupOpen(false);
              updateFilter({
                date: date as Date,
                prevDate: toDate,
                otherDate: fromDate,
                fromDateOrToDateChanged: 'toDate',
                onChange: props.onChange,
              });
            }}
            onOpen={() => setPopupOpen(true)}
            onClose={() => {
              setPopupOpen(false);
              updateFilter({
                date: toDate,
                prevDate: toDate,
                otherDate: fromDate,
                fromDateOrToDateChanged: 'toDate',
                onChange: props.onChange,
              });
            }}
            views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': 'to, date-time picker',
            }}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error ||
                  invalidDateRange ||
                  (toDate && !isValid(toDate))) ??
                undefined;
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
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
        </Grid>
      </LocalizationProvider>
    </Box>
  );
};

DateTimeFilter.displayName = 'DateTimeFilter';

const DateTimeInputBox = (): React.ReactElement => {
  const dateRange = useAppSelector((state) => state.search.dateRange);

  const dispatch = useAppDispatch();
  const handleDateTimeChange = React.useCallback(
    (value: { fromDate?: string; toDate?: string }) => {
      dispatch(changeDateRange(value));
    },
    [dispatch]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '500px',
      }}
    >
      <DateTimeFilter
        value={{ fromDate: dateRange?.fromDate, toDate: dateRange?.toDate }}
        onChange={handleDateTimeChange}
      />
      <div style={{ marginLeft: 15, marginRight: 15 }} />
    </div>
  );
};

DateTimeInputBox.displayName = 'DateTimeInputBox';

export default DateTimeInputBox;
