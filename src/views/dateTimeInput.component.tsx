import React from 'react';
import { format, isValid, isEqual, isBefore } from 'date-fns';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { TextField, Typography } from '@mui/material';
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
  label: 'startDateFilter' | 'endDateFilter';
  date: Date | null;
  prevDate: Date | null;
  otherDate: Date | null;
  fromDateOrToDateChanged: 'fromDate' | 'toDate';
  onChange: (
    label: 'startDateFilter' | 'endDateFilter',
    range: 'fromDate' | 'toDate',
    date?: string
  ) => void;
}

export function updateFilter({
  label,
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
      onChange(
        label,
        fromDateOrToDateChanged,
        format(date, 'yyyy-MM-dd HH:mm:ss')
      );
    }
  } else if (!date) {
    onChange(label, fromDateOrToDateChanged);
  }
}

export interface DateTimeFilterProps {
  label: 'startDateFilter' | 'endDateFilter';
  onChange: (
    label: 'startDateFilter' | 'endDateFilter',
    range: 'fromDate' | 'toDate',
    date?: string
  ) => void;
  receivedFromDate?: string;
  receivedToDate?: string;
}

export const DateTimeFilter = (
  props: DateTimeFilterProps
): React.ReactElement => {
  const { label, onChange, receivedFromDate, receivedToDate } = props;

  const [fromDate, setFromDate] = React.useState<Date | null>(
    receivedFromDate ? new Date(receivedFromDate) : null
  );
  const [toDate, setToDate] = React.useState<Date | null>(
    receivedToDate ? new Date(receivedToDate) : null
  );

  const [popupOpen, setPopupOpen] = React.useState<boolean>(false);

  const invalidDateRange = fromDate && toDate && isBefore(toDate, fromDate);

  return (
    <form style={{ display: 'inline-grid' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          inputFormat="yyyy-MM-dd HH:mm:ss"
          mask="____-__-__ __:__:__"
          value={fromDate}
          maxDateTime={toDate || new Date('2100-01-01 00:00:00')}
          onChange={(date) => {
            setFromDate(date as Date);
            if (!popupOpen) {
              updateFilter({
                label: label,
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
              label: label,
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
            'aria-label': `${label} from, date-time picker`,
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
                id={`${label} from`}
                inputProps={{
                  ...renderProps.inputProps,
                  placeholder: 'From...',
                  'aria-label': `${label} from, date-time input`,
                }}
                variant="standard"
                error={error}
                {...(error && { helperText: helperText })}
              />
            );
          }}
        />
        <DateTimePicker
          inputFormat="yyyy-MM-dd HH:mm:ss"
          mask="____-__-__ __:__:__"
          value={toDate}
          minDateTime={fromDate || new Date('1984-01-01 00:00:00')}
          onChange={(date) => {
            setToDate(date as Date);
            if (!popupOpen) {
              updateFilter({
                label: label,
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
              label: label,
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
            'aria-label': `${label} to, date-time picker`,
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
                id={`${label} to`}
                inputProps={{
                  ...renderProps.inputProps,
                  placeholder: 'To...',
                  'aria-label': `${label} to, date-time input`,
                }}
                variant="standard"
                error={error}
                {...(error && { helperText: helperText })}
              />
            );
          }}
        />
      </LocalizationProvider>
    </form>
  );
};

DateTimeFilter.displayName = 'DateTimeFilter';

export interface DateTimeInputBoxProps {
  startDateRange?: DateRange;
  endDateRange?: DateRange;
  onChange: (
    label: 'startDateFilter' | 'endDateFilter',
    range: 'fromDate' | 'toDate',
    date?: string
  ) => void;
}

const DateTimeInputBox = (props: DateTimeInputBoxProps): React.ReactElement => {
  const { startDateRange, endDateRange, onChange } = props;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '500px',
      }}
    >
      <div>
        <Typography variant="h6">Start date/time</Typography>
        <DateTimeFilter
          label="startDateFilter"
          receivedFromDate={startDateRange?.fromDate}
          receivedToDate={startDateRange?.toDate}
          onChange={onChange}
        />
      </div>
      <div style={{ marginLeft: 15, marginRight: 15 }} />
      <div>
        <Typography variant="h6">End date/time</Typography>
        <DateTimeFilter
          label="endDateFilter"
          receivedFromDate={endDateRange?.fromDate}
          receivedToDate={endDateRange?.toDate}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

DateTimeInputBox.displayName = 'DateTimeInputBox';

export default DateTimeInputBox;
