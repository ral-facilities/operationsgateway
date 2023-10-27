import React from 'react';
import {
  Autocomplete,
  Box,
  Grid,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Search, Close } from '@mui/icons-material';
import {
  XAxisScale,
  FullScalarChannelMetadata,
  timeChannelName,
} from '../../app.types';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isBefore, isValid } from 'date-fns';

const StyledClose = styled(Close)(() => ({
  cursor: 'pointer',
  color: 'black',
  '&:hover': {
    color: 'red',
  },
}));

export interface XAxisTabProps {
  allChannels: FullScalarChannelMetadata[];
  XAxisScale: XAxisScale;
  XAxis?: string;
  changeXAxis: (value?: string) => void;
  changeXAxisScale: (value: XAxisScale) => void;
  initialXMinimum?: number;
  initialXMaximum?: number;
  changeXMinimum: (value: number | undefined) => void;
  changeXMaximum: (value: number | undefined) => void;
}

const CustomTextField: React.FC<TextFieldProps> = (renderProps) => {
  const { invalidDateRange, id, date, ...inputProps } =
    renderProps.inputProps ?? {};
  const error =
    (renderProps.error || invalidDateRange || (date && !isValid(date))) ??
    undefined;
  let helperText = 'Date-time format: yyyy-MM-dd HH:mm';
  if (invalidDateRange) helperText = 'Invalid date-time range';
  return (
    <TextField
      {...renderProps}
      id={id}
      inputProps={{
        ...inputProps,
        sx: {
          fontSize: 10,
        },
      }}
      variant="standard"
      error={error}
      {...(error && { helperText: helperText })}
    />
  );
};

// if XAxis === "timestamp", only render min/max config
const XAxisTab = (props: XAxisTabProps) => {
  const {
    allChannels,
    XAxisScale,
    XAxis,
    changeXAxis,
    changeXAxisScale,
    initialXMinimum,
    initialXMaximum,
    changeXMinimum,
    changeXMaximum,
  } = props;

  // We define these as strings so the user can type decimal points
  // We then attempt to parse numbers from them whenever their values change
  const [xMinimum, setXMinimum] = React.useState<string>(
    typeof initialXMinimum !== 'undefined' && XAxisScale !== 'time'
      ? '' + initialXMinimum
      : ''
  );
  const [xMaximum, setXMaximum] = React.useState<string>(
    typeof initialXMaximum !== 'undefined' && XAxisScale !== 'time'
      ? '' + initialXMaximum
      : ''
  );

  const [fromDate, setFromDate] = React.useState<Date | null>(
    typeof initialXMinimum !== 'undefined' && XAxisScale === 'time'
      ? new Date(initialXMinimum)
      : null
  );
  const [toDate, setToDate] = React.useState<Date | null>(
    typeof initialXMaximum !== 'undefined' && XAxisScale === 'time'
      ? new Date(initialXMaximum)
      : null
  );

  // set seconds to 0 for fromDate
  if (fromDate) {
    fromDate.setSeconds(0);
  }
  // set seconds to 59 for toDate
  if (toDate) {
    toDate.setSeconds(59);
  }
  const [XAxisInputVal, setXAxisInputVal] = React.useState<string>('');

  const invalidXRange = parseFloat(xMinimum) > parseFloat(xMaximum);
  const invalidDateRange = fromDate && toDate && isBefore(toDate, fromDate);

  React.useEffect(() => {
    if (XAxisScale !== 'time') {
      const parsedXMinimum = parseFloat(xMinimum);
      if (!Number.isNaN(parsedXMinimum)) {
        changeXMinimum(parsedXMinimum);
      } else {
        changeXMinimum(undefined);
      }
    }
  }, [XAxisScale, changeXMinimum, xMinimum]);

  React.useEffect(() => {
    if (XAxisScale !== 'time') {
      const parsedXMaximum = parseFloat(xMaximum);
      if (!Number.isNaN(parsedXMaximum)) {
        changeXMaximum(parsedXMaximum);
      } else {
        changeXMaximum(undefined);
      }
    }
  }, [XAxisScale, changeXMaximum, xMaximum]);

  React.useEffect(() => {
    if (XAxisScale === 'time') {
      if (fromDate) {
        const unixTimestamp = fromDate.getTime();
        if (!Number.isNaN(unixTimestamp)) changeXMinimum(unixTimestamp);
      } else {
        changeXMinimum(undefined);
      }
    }
  }, [fromDate, changeXMinimum, XAxisScale]);

  React.useEffect(() => {
    if (XAxisScale === 'time') {
      if (toDate) {
        const unixTimestamp = toDate.getTime();
        if (!Number.isNaN(unixTimestamp)) changeXMaximum(unixTimestamp);
      } else {
        changeXMaximum(undefined);
      }
    }
  }, [toDate, changeXMaximum, XAxisScale]);

  const handleChangeXScale = React.useCallback(
    (value: string) => {
      changeXAxisScale(value as XAxisScale);
      setFromDate(null);
      setToDate(null);
      setXMinimum('');
      setXMaximum('');
    },
    [changeXAxisScale]
  );

  const handleXAxisChange = React.useCallback(
    (value?: string) => {
      changeXAxis(value);
      if (value === timeChannelName) {
        handleChangeXScale('time');
      } else {
        handleChangeXScale('linear');
      }
    },
    [changeXAxis, handleChangeXScale]
  );

  const xAxisChannel = allChannels.find(
    (channel) => channel.systemName === XAxis
  );
  const xAxisLabel =
    xAxisChannel && xAxisChannel.name ? xAxisChannel.name : XAxis;

  return (
    <Grid container spacing={1} mt={1}>
      <Grid container item spacing={1}>
        <Grid item xs={6}>
          {XAxisScale === 'time' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                format="yyyy-MM-dd HH:mm"
                value={fromDate}
                maxDateTime={toDate || new Date('2100-01-01 00:00:00')}
                onChange={(date) => {
                  setFromDate(date as Date);
                }}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                slots={{
                  textField: CustomTextField,
                }}
                slotProps={{
                  actionBar: { actions: ['clear', 'cancel', 'accept'] },
                  openPickerButton: {
                    size: 'small',
                    'aria-label': 'from, date-time picker',
                  },
                  textField: {
                    inputProps: {
                      invalidDateRange: invalidDateRange,
                      id: 'from date-time',
                      placeholder: 'From...',
                      'aria-label': 'from, date-time input',
                      date: fromDate,
                    },
                  },
                }}
              />
            </LocalizationProvider>
          ) : (
            <TextField
              label="Min"
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{ style: { fontSize: 12 } }}
              InputLabelProps={{ style: { fontSize: 12 } }}
              error={invalidXRange}
              {...(invalidXRange && { helperText: 'Invalid range' })}
              value={xMinimum}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setXMinimum(event.target.value)
              }
            />
          )}
        </Grid>
        <Grid item xs={6}>
          {XAxisScale === 'time' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                format="yyyy-MM-dd HH:mm"
                value={toDate}
                minDateTime={fromDate || new Date('1984-01-01 00:00:00')}
                onChange={(date) => {
                  setToDate(date as Date);
                }}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                slots={{
                  textField: CustomTextField,
                }}
                slotProps={{
                  actionBar: { actions: ['clear', 'cancel', 'accept'] },
                  openPickerButton: {
                    size: 'small',
                    'aria-label': 'to, date-time picker',
                  },
                  textField: {
                    inputProps: {
                      invalidDateRange: invalidDateRange,
                      id: 'to date-time',
                      placeholder: 'To...',
                      'aria-label': 'to, date-time input',
                      date: toDate,
                    },
                  },
                }}
              />
            </LocalizationProvider>
          ) : (
            <TextField
              label="Max"
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{ style: { fontSize: 12 } }}
              InputLabelProps={{ style: { fontSize: 12 } }}
              error={invalidXRange}
              {...(invalidXRange && { helperText: 'Invalid range' })}
              value={xMaximum}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setXMaximum(event.target.value)
              }
            />
          )}
        </Grid>
      </Grid>
      {XAxis !== timeChannelName && (
        <>
          <Grid item>
            <FormControl sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <FormLabel id="x-scale-group-label" sx={{ mr: 1 }}>
                Scale
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="x-scale-group-label"
                name="x scale radio buttons group"
                value={XAxisScale}
                onChange={(_, value) => handleChangeXScale(value)}
              >
                <FormControlLabel
                  value="linear"
                  control={<Radio />}
                  label="Linear"
                />
                <FormControlLabel
                  value="logarithmic"
                  control={<Radio />}
                  label="Log"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid container item>
            <Autocomplete
              disablePortal
              clearOnBlur
              id="select x axis"
              options={allChannels
                // don't let the user select timestamp in an XY plot
                .filter((channel) => channel.systemName !== timeChannelName)
                .map((channel) => ({
                  label: channel.name ?? channel.systemName,
                  value: channel.systemName,
                }))}
              fullWidth
              role="autocomplete"
              onInputChange={(_, newInputValue, reason) => {
                if (reason === 'input') {
                  setXAxisInputVal(newInputValue);
                }
              }}
              inputValue={XAxisInputVal}
              value={null}
              onChange={(_, newValue) => {
                if (newValue) {
                  handleXAxisChange(newValue.value);
                }
                setXAxisInputVal('');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { fontSize: 12 } }}
                  InputProps={{
                    ...params.InputProps,
                    style: { fontSize: 12 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </>
      )}
      {XAxis && XAxis !== timeChannelName && (
        <Grid container item>
          <Box
            aria-label={`${xAxisLabel} label`}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: 'inherit',
              justifyContent: 'space-between',
              border: 1,
              padding: 1,
            }}
          >
            <Typography maxWidth="240" noWrap>
              {xAxisLabel}
            </Typography>
            <StyledClose
              aria-label={`Remove ${xAxisLabel} from x-axis`}
              onClick={() => handleXAxisChange(undefined)}
            />
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default XAxisTab;
