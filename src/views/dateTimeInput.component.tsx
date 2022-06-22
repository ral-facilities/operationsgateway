import React from 'react';
import { format, isValid, isEqual, isBefore } from 'date-fns';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { TextField } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { FiltersType, DateFilter, DateRange } from '../app.types';

const datesEqual = (date1: Date | null, date2: Date | null): boolean => {
  if (date1 === date2) {
    return true;
  } else if (!isValid(date1) && !isValid(date2)) {
    return true;
  }
  return date1 !== null && date2 !== null && isEqual(date1, date2);
};

interface UpdateFilterParams {
  label: 'startDateFilter' | 'endDateFilter';
  date: Date | null;
  otherDate: Date | null;
  fromDateOrToDateChanged: 'fromDate' | 'toDate';
  onChange: (
    label: 'startDateFilter' | 'endDateFilter',
    range: 'fromDate' | 'toDate',
    date: string
  ) => void;
}

export function updateFilter({
  label,
  date,
  otherDate,
  fromDateOrToDateChanged,
  onChange,
}: UpdateFilterParams): void {
  if (date && isValid(date) && !datesEqual(date, otherDate)) {
    onChange(
      label,
      fromDateOrToDateChanged,
      format(date, 'yyyy-MM-dd HH:mm:ss')
    );
  }
}

interface DateTimeFilterProps {
  label: 'startDateFilter' | 'endDateFilter';
  onChange: (
    label: 'startDateFilter' | 'endDateFilter',
    range: 'fromDate' | 'toDate',
    date: string
  ) => void;
  receivedFromDate?: string;
  receivedToDate?: string;
}

const DateTimeFilter = (props: DateTimeFilterProps): React.ReactElement => {
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
            if (!popupOpen && isValid(date as Date)) {
              if (toDate && !isBefore(date as Date, toDate)) return;
              updateFilter({
                label: label,
                date: date as Date,
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
            if (!popupOpen && isValid(date as Date)) {
              if (fromDate && isBefore(date as Date, fromDate)) return;
              updateFilter({
                label: label,
                date: date as Date,
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

interface DateTimeInputBoxProps {
  startDateRange?: DateRange;
  endDateRange?: DateRange;
  onChange: (
    label: 'startDateFilter' | 'endDateFilter',
    range: 'fromDate' | 'toDate',
    date: string
  ) => void;
}

const DateTimeInputBox = (props: DateTimeInputBoxProps): React.ReactElement => {
  const { startDateRange, endDateRange, onChange } = props;

  return (
    <div>
      <DateTimeFilter
        label="startDateFilter"
        receivedFromDate={startDateRange?.fromDate}
        receivedToDate={startDateRange?.toDate}
        onChange={onChange}
      />
      <DateTimeFilter
        label="endDateFilter"
        receivedFromDate={endDateRange?.fromDate}
        receivedToDate={endDateRange?.toDate}
        onChange={onChange}
      />
    </div>
  );
};

DateTimeInputBox.displayName = 'DateTimeInputBox';

export default DateTimeInputBox;

export const useDateTimeFilter = (
  filters: FiltersType,
  handleDateTimeChange: (label: string, date: DateFilter | null) => void
): ((dataKey: string) => React.ReactElement) => {
  return React.useMemo(() => {
    const dateTimeFilter = (dataKey: string): React.ReactElement => (
      <DateTimeInputBox
        // value={filters[dataKey] as DateFilter}
        onChange={(
          label: 'startDateFilter' | 'endDateFilter',
          range: 'fromDate' | 'toDate',
          date: string
        ) => {
          // handleDateTimeChange(dataKey, value ?? null);
        }}
      />
    );
    return dateTimeFilter;
  }, [filters, handleDateTimeChange]);
};
