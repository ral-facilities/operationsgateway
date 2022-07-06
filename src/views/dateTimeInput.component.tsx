import React from 'react';
import { format, isValid, isEqual, isBefore } from 'date-fns';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { TextField, Divider, Typography, Box } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DateRange } from '../app.types';

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
  onChange: (range: 'fromDate' | 'toDate', date?: string) => void;
}

export function updateFilter({
  date,
  prevDate,
  otherDate,
  fromDateOrToDateChanged,
  onChange,
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

    if (validFromDate || validToDate) {
      onChange(fromDateOrToDateChanged, format(date, 'yyyy-MM-dd HH:mm:ss'));
    }
  } else if (!date) {
    onChange(fromDateOrToDateChanged);
  }
}

export interface DateTimeFilterProps {
  onChange: (range: 'fromDate' | 'toDate', date?: string) => void;
  receivedFromDate?: string;
  receivedToDate?: string;
}

export const DateTimeFilter = (
  props: DateTimeFilterProps
): React.ReactElement => {
  const { onChange, receivedFromDate, receivedToDate } = props;

  const [fromDate, setFromDate] = React.useState<Date | null>(
    receivedFromDate ? new Date(receivedFromDate) : null
  );
  const [toDate, setToDate] = React.useState<Date | null>(
    receivedToDate ? new Date(receivedToDate) : null
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
        <form style={{ display: 'inline-grid', padding: 3 }}>
          <Typography>From date/time</Typography>
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm:ss"
            mask="____-__-__ __:__:__"
            value={fromDate}
            maxDateTime={toDate || new Date('2100-01-01 00:00:00')}
            onChange={(date) => {
              setFromDate(date as Date);
              if (!popupOpen) {
                updateFilter({
                  date: date as Date,
                  prevDate: fromDate,
                  otherDate: toDate,
                  fromDateOrToDateChanged: 'fromDate',
                  onChange: onChange,
                });
              }
            }}
            onAccept={(date) => {
              updateFilter({
                date: date as Date,
                prevDate: fromDate,
                otherDate: toDate,
                fromDateOrToDateChanged: 'fromDate',
                onChange: onChange,
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
          sx={{ margin: 2, borderBottomWidth: 5 }}
        />
        <form style={{ display: 'inline-grid', padding: 3 }}>
          <Typography>To date/time</Typography>
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm:ss"
            mask="____-__-__ __:__:__"
            value={toDate}
            minDateTime={fromDate || new Date('1984-01-01 00:00:00')}
            onChange={(date) => {
              setToDate(date as Date);
              if (!popupOpen) {
                updateFilter({
                  date: date as Date,
                  prevDate: toDate,
                  otherDate: fromDate,
                  fromDateOrToDateChanged: 'toDate',
                  onChange: onChange,
                });
              }
            }}
            onAccept={(date) => {
              updateFilter({
                date: date as Date,
                prevDate: toDate,
                otherDate: fromDate,
                fromDateOrToDateChanged: 'toDate',
                onChange: onChange,
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

DateTimeFilter.displayName = 'DateTimeFilter';

export interface DateTimeInputBoxProps {
  dateRange?: DateRange;
  onChange: (range: 'fromDate' | 'toDate', date?: string) => void;
}

const DateTimeInputBox = (props: DateTimeInputBoxProps): React.ReactElement => {
  const { dateRange, onChange } = props;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '500px',
      }}
    >
      <DateTimeFilter
        receivedFromDate={dateRange?.fromDate}
        receivedToDate={dateRange?.toDate}
        onChange={onChange}
      />
      <div style={{ marginLeft: 15, marginRight: 15 }} />
    </div>
  );
};

DateTimeInputBox.displayName = 'DateTimeInputBox';

export default DateTimeInputBox;
