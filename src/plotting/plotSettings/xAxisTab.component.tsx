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
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { XAxisScale, FullScalarChannelMetadata } from '../../app.types';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isBefore } from 'date-fns';

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
  changeXAxis: (value: string) => void;
  changeXAxisScale: (value: XAxisScale) => void;
  changeXMinimum: (value: number | undefined) => void;
  changeXMaximum: (value: number | undefined) => void;
}

const XAxisTab = (props: XAxisTabProps) => {
  const {
    allChannels,
    XAxisScale,
    XAxis,
    changeXAxis,
    changeXAxisScale,
    changeXMinimum,
    changeXMaximum,
  } = props;

  // We define these as strings so the user can type decimal points
  // We then attempt to parse numbers from them whenever their values change
  const [xMinimum, setXMinimum] = React.useState<string>('');
  const [xMaximum, setXMaximum] = React.useState<string>('');

  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);
  const [XAxisInputVal, setXAxisInputVal] = React.useState<string>('');

  const invalidXRange = parseFloat(xMinimum) > parseFloat(xMaximum);
  const invalidDateRange = fromDate && toDate && isBefore(toDate, fromDate);

  React.useEffect(() => {
    if (xMinimum && parseFloat(xMinimum)) {
      changeXMinimum(parseFloat(xMinimum));
    } else {
      changeXMinimum(undefined);
    }
  }, [changeXMinimum, xMinimum]);

  React.useEffect(() => {
    if (xMaximum && parseFloat(xMaximum)) {
      changeXMaximum(parseFloat(xMaximum));
    } else {
      changeXMaximum(undefined);
    }
  }, [changeXMaximum, xMaximum]);

  React.useEffect(() => {
    if (fromDate) {
      const unixTimestamp = fromDate.getTime();
      if (!isNaN(unixTimestamp)) changeXMinimum(unixTimestamp);
    } else {
      changeXMinimum(undefined);
    }
  }, [fromDate, changeXMinimum]);

  React.useEffect(() => {
    if (toDate) {
      const unixTimestamp = toDate.getTime();
      if (!isNaN(unixTimestamp)) changeXMaximum(unixTimestamp);
    } else {
      changeXMaximum(undefined);
    }
  }, [toDate, changeXMaximum]);

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
    (value: string) => {
      changeXAxis(value);
      if (value === 'timestamp') {
        handleChangeXScale('time');
      } else {
        handleChangeXScale('linear');
      }
    },
    [changeXAxis, handleChangeXScale]
  );

  return (
    <Grid container spacing={1} mt={1}>
      <Grid container item spacing={1}>
        <Grid item xs={6}>
          {XAxisScale === 'time' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                inputFormat="yyyy-MM-dd HH:mm:ss"
                mask="____-__-__ __:__:__"
                value={fromDate}
                maxDateTime={toDate || new Date('2100-01-01 00:00:00')}
                componentsProps={{
                  actionBar: { actions: ['clear'] },
                }}
                onChange={(date) => {
                  setFromDate(date as Date);
                }}
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
                        style: {
                          fontSize: 10,
                        },
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
                inputFormat="yyyy-MM-dd HH:mm:ss"
                mask="____-__-__ __:__:__"
                value={toDate}
                minDateTime={fromDate || new Date('1984-01-01 00:00:00')}
                componentsProps={{
                  actionBar: { actions: ['clear'] },
                }}
                onChange={(date) => {
                  setToDate(date as Date);
                }}
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
                        style: {
                          fontSize: 10,
                        },
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
      <Grid item>
        <FormControl
          disabled={XAxisScale === 'time'}
          sx={{ flexDirection: 'row', alignItems: 'center' }}
        >
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
          freeSolo
          clearOnBlur
          id="select x axis"
          options={allChannels.map((channel) => channel.systemName)}
          fullWidth
          role="autocomplete"
          onInputChange={(_, newInputValue, reason) => {
            if (reason === 'input') {
              setXAxisInputVal(newInputValue);
            }
          }}
          inputValue={XAxisInputVal}
          value={XAxisInputVal}
          onChange={(_, newValue) => {
            if (newValue) {
              handleXAxisChange(newValue);
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
      {XAxis && (
        <Grid container item>
          <Box
            aria-label={`${XAxis} label`}
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
              {XAxis}
            </Typography>
            <StyledClose
              aria-label={`Remove ${XAxis} from x-axis`}
              onClick={() => handleXAxisChange('')}
            />
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default XAxisTab;
