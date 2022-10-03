import React from 'react';
import {
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Box,
  Tab,
  Tabs,
  styled,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Autocomplete,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ScatterPlot,
  ShowChart,
  Search,
  Close,
  Visibility,
  VisibilityOff,
  LineStyle,
} from '@mui/icons-material';
import {
  XAxisSettings,
  YAxisSettings,
  FullScalarChannelMetadata,
  PlotType,
  SelectedPlotChannel,
} from '../app.types';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { isBefore } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const StyledClose = styled(Close)(() => ({
  cursor: 'pointer',
  color: 'black',
  '&:hover': {
    color: 'red',
  },
}));

type TabValue = 'X' | 'Y';

interface TabPanelProps {
  children?: React.ReactNode;
  value: TabValue;
  label: TabValue;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, label, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== label}
      id={`${label}-tabpanel`}
      aria-labelledby={`${label}-tab`}
      {...other}
    >
      {value === label && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(label: TabValue) {
  return {
    id: `${label}-tab`,
    'aria-controls': `${label}-tabpanel`,
  };
}

const StyledTab = styled(Tab)(() => ({
  minHeight: 30,
  minWidth: 10,
  height: 30,
  width: 10,
}));

export interface PlotSettingsProps {
  channels: FullScalarChannelMetadata[];
  changePlotTitle: (title: string) => void;
  plotType: PlotType;
  changePlotType: (plotType: PlotType) => void;
  XAxis: string;
  changeXAxis: (value: string) => void;
  XAxisSettings: XAxisSettings;
  changeXAxisSettings: (XAxisSettings: XAxisSettings) => void;
  YAxesSettings: YAxisSettings;
  changeYAxesSettings: (YAxesSettings: YAxisSettings) => void;
  selectedChannels: SelectedPlotChannel[];
  changeSelectedChannels: (selectedChannels: SelectedPlotChannel[]) => void;
  changeXMinimum: (value: number | undefined) => void;
  changeXMaximum: (value: number | undefined) => void;
  changeYMinimum: (value: number | undefined) => void;
  changeYMaximum: (value: number | undefined) => void;
}

const PlotSettings = (props: PlotSettingsProps) => {
  const {
    channels,
    changePlotTitle,
    plotType,
    changePlotType,
    XAxis,
    changeXAxis,
    XAxisSettings,
    changeXAxisSettings,
    YAxesSettings,
    changeYAxesSettings,
    selectedChannels,
    changeSelectedChannels,
    changeXMinimum,
    changeXMaximum,
    changeYMinimum,
    changeYMaximum,
  } = props;
  const { scale: XScale } = XAxisSettings;
  const { scale: YScale } = YAxesSettings;

  const [title, setTitle] = React.useState('');
  const deferredTitle = React.useDeferredValue(title);

  const [xMinimum, setXMinimum] = React.useState<string>('');
  const [xMaximum, setXMaximum] = React.useState<string>('');
  const [yMinimum, setYMinimum] = React.useState<string>('');
  const [yMaximum, setYMaximum] = React.useState<string>('');

  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);

  const invalidXRange = parseFloat(xMinimum) > parseFloat(xMaximum);
  const invalidYRange = parseFloat(yMinimum) > parseFloat(yMaximum);
  const invalidDateRange = fromDate && toDate && isBefore(toDate, fromDate);

  const [XAxisInputVal, setXAxisInputVal] = React.useState<string>('');
  const [autocompleteValue, setAutocompleteValue] = React.useState<string>('');

  const handleChangeTitle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
  );

  const handleChangeChartType = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, newChartType: PlotType) => {
      changePlotType(newChartType);
    },
    [changePlotType]
  );

  const handleChangeXScale = React.useCallback(
    (value: string) => {
      changeXAxisSettings({
        ...XAxisSettings,
        scale: value as XAxisSettings['scale'],
      });
      setFromDate(null);
      setToDate(null);
      setXMinimum('');
      setXMaximum('');
      setYMinimum('');
      setYMaximum('');
    },
    [XAxisSettings, changeXAxisSettings]
  );

  const handleChangeYScale = React.useCallback(
    (value: string) => {
      changeYAxesSettings({
        ...YAxesSettings,
        scale: value as YAxisSettings['scale'],
      });
    },
    [YAxesSettings, changeYAxesSettings]
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

  React.useEffect(() => {
    changePlotTitle(deferredTitle);
  }, [changePlotTitle, deferredTitle]);

  const [XYTabValue, setXYTabValue] = React.useState<TabValue>('X');

  const handleXYTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: TabValue) => {
      setXYTabValue(newValue);
    },
    [setXYTabValue]
  );

  React.useEffect(() => {
    if (xMinimum) {
      if (parseFloat(xMinimum)) changeXMinimum(parseFloat(xMinimum));
    } else {
      changeXMinimum(undefined);
    }
  }, [changeXMinimum, xMinimum]);

  React.useEffect(() => {
    if (xMaximum) {
      if (parseFloat(xMaximum)) changeXMaximum(parseFloat(xMaximum));
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

  React.useEffect(() => {
    if (yMinimum) {
      if (parseFloat(yMinimum)) changeYMinimum(parseFloat(yMinimum));
    } else {
      changeYMinimum(undefined);
    }
  }, [changeYMinimum, yMinimum]);

  React.useEffect(() => {
    if (yMaximum) {
      if (parseFloat(yMaximum)) changeYMaximum(parseFloat(yMaximum));
    } else {
      changeYMaximum(undefined);
    }
  }, [changeYMaximum, yMaximum]);

  const addPlotChannel = React.useCallback(
    (channelName: string) => {
      const newSelectedChannel: SelectedPlotChannel = {
        name: channelName,
        options: {
          visible: true,
          lineStyle: 'solid',
        },
      };

      const newselectedChannelsArray = Array.from(selectedChannels);
      newselectedChannelsArray.push(newSelectedChannel);
      changeSelectedChannels(newselectedChannelsArray);
    },
    [changeSelectedChannels, selectedChannels]
  );

  const removePlotChannel = React.useCallback(
    (channelName: string) => {
      const newSelectedChannelsArray = selectedChannels.filter(
        (channel) => channel.name !== channelName
      );
      changeSelectedChannels(newSelectedChannelsArray);
      if (newSelectedChannelsArray.length === 0) {
        handleChangeYScale('linear');
      }
    },
    [changeSelectedChannels, handleChangeYScale, selectedChannels]
  );

  const toggleChannelVisibility = React.useCallback(
    (channelName: string) => {
      const newSelectedChannelsArray = Array.from(selectedChannels);
      newSelectedChannelsArray.some((channel) => {
        if (channel.name === channelName) {
          channel.options.visible = !channel.options.visible;
          return true;
        }
        return false;
      });
      changeSelectedChannels(newSelectedChannelsArray);
    },
    [changeSelectedChannels, selectedChannels]
  );

  const toggleChannelLineStyle = React.useCallback(
    (channelName: string) => {
      const newSelectedChannelsArray = Array.from(selectedChannels);
      newSelectedChannelsArray.some((channel) => {
        if (channel.name === channelName) {
          if (channel.options.lineStyle === 'solid')
            channel.options.lineStyle = 'dashed';
          else if (channel.options.lineStyle === 'dashed')
            channel.options.lineStyle = 'dotted';
          else channel.options.lineStyle = 'solid';
          return true;
        }
        return false;
      });
      changeSelectedChannels(newSelectedChannelsArray);
    },
    [changeSelectedChannels, selectedChannels]
  );

  const [axisSelectionOptions, setAxisSelectionOptions] = React.useState<
    string[]
  >(['timestamp', 'shotnum', 'activeArea', 'activeExperiment']);

  const populateAxisSelectionOptions = (
    metadata: FullScalarChannelMetadata[]
  ): void => {
    const ops: string[] = [
      'timestamp',
      'shotnum',
      'activeArea',
      'activeExperiment',
    ];

    metadata.forEach((meta: FullScalarChannelMetadata) => {
      ops.push(meta.systemName);
    });

    setAxisSelectionOptions(ops);
  };

  React.useEffect(() => {
    if (channels) populateAxisSelectionOptions(channels);
  }, [channels]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <TextField
          label="Title"
          variant="outlined"
          size="small"
          value={title}
          onChange={handleChangeTitle}
          fullWidth
          InputProps={{ style: { fontSize: 12 } }}
          InputLabelProps={{ style: { fontSize: 12 } }}
        />
      </Grid>
      <Grid container item spacing={1}>
        {/* TODO: what do these control? we need to hook them up */}
        <Grid item xs={6}>
          <TextField
            label="Hours"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{ style: { fontSize: 12 } }}
            InputLabelProps={{ style: { fontSize: 12 } }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Points"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{ style: { fontSize: 12 } }}
            InputLabelProps={{ style: { fontSize: 12 } }}
          />
        </Grid>
      </Grid>
      <Grid item>
        <ToggleButtonGroup
          value={plotType}
          exclusive
          onChange={handleChangeChartType}
          aria-label="chart type"
        >
          <ToggleButton value="scatter" aria-label="scatter chart">
            <ScatterPlot />
          </ToggleButton>
          <ToggleButton value="line" aria-label="line chart">
            <ShowChart />
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid item>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={XYTabValue}
            onChange={handleXYTabChange}
            aria-label="tabs"
            sx={{ height: 30, minHeight: 30 }}
          >
            <StyledTab value="X" label="X" {...a11yProps('X')} />
            <StyledTab value="Y" label="Y" {...a11yProps('Y')} />
          </Tabs>
        </Box>
        <TabPanel value={XYTabValue} label={'X'}>
          <Grid container spacing={1} mt={1}>
            <Grid container item spacing={1}>
              <Grid item xs={6}>
                {XAxisSettings.scale === 'time' ? (
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
                      views={[
                        'year',
                        'month',
                        'day',
                        'hours',
                        'minutes',
                        'seconds',
                      ]}
                      OpenPickerButtonProps={{
                        size: 'small',
                        'aria-label': 'from, date-time picker',
                      }}
                      renderInput={(renderProps) => {
                        const error =
                          // eslint-disable-next-line react/prop-types
                          (renderProps.error || invalidDateRange) ?? undefined;
                        let helperText =
                          'Date-time format: yyyy-MM-dd HH:mm:ss';
                        if (invalidDateRange)
                          helperText = 'Invalid date-time range';

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
                {XAxisSettings.scale === 'time' ? (
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
                      views={[
                        'year',
                        'month',
                        'day',
                        'hours',
                        'minutes',
                        'seconds',
                      ]}
                      OpenPickerButtonProps={{
                        size: 'small',
                        'aria-label': 'to, date-time picker',
                      }}
                      renderInput={(renderProps) => {
                        const error =
                          // eslint-disable-next-line react/prop-types
                          (renderProps.error || invalidDateRange) ?? undefined;
                        let helperText =
                          'Date-time format: yyyy-MM-dd HH:mm:ss';
                        if (invalidDateRange)
                          helperText = 'Invalid date-time range';

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
                disabled={XAxisSettings.scale === 'time'}
                sx={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <FormLabel id="x-scale-group-label" sx={{ mr: 1 }}>
                  Scale
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="x-scale-group-label"
                  name="x scale radio buttons group"
                  value={XScale}
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
                options={axisSelectionOptions}
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
        </TabPanel>
        <TabPanel value={XYTabValue} label={'Y'}>
          <Grid container spacing={1} mt={1}>
            <Grid container item spacing={1}>
              <Grid item xs={6}>
                <TextField
                  label="Min"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
                  error={invalidYRange}
                  {...(invalidYRange && { helperText: 'Invalid range' })}
                  value={yMinimum}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setYMinimum(event.target.value)
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
                  error={invalidYRange}
                  {...(invalidYRange && { helperText: 'Invalid range' })}
                  value={yMaximum}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setYMaximum(event.target.value)
                  }
                />
              </Grid>
            </Grid>
            <Grid item>
              <FormControl sx={{ flexDirection: 'row', alignItems: 'center' }}>
                <FormLabel id="y-scale-group-label" sx={{ mr: 1 }}>
                  Scale
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="y-scale-group-label"
                  name="y scale radio buttons group"
                  value={YScale}
                  onChange={(_, value) => handleChangeYScale(value)}
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
                id="select data channels"
                options={axisSelectionOptions.filter(
                  (option) =>
                    option !== 'timestamp' &&
                    !selectedChannels
                      .map((channel) => channel.name)
                      .includes(option)
                )}
                fullWidth
                role="autocomplete"
                inputValue={autocompleteValue}
                value={autocompleteValue}
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'input') {
                    setAutocompleteValue(newInputValue);
                  }
                }}
                onChange={(_, newValue) => {
                  if (newValue) {
                    addPlotChannel(newValue);
                  }
                  setAutocompleteValue('');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search all channels"
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
            {selectedChannels.map((plotChannel) => (
              <Grid container item key={plotChannel.name}>
                <Box
                  aria-label={`${plotChannel.name} label`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 'inherit',
                    justifyContent: 'space-between',
                    border: 1,
                    padding: 1,
                  }}
                >
                  <Typography maxWidth="174" noWrap>
                    {plotChannel.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                  >
                    <Tooltip
                      title="Toggle visibility"
                      arrow
                      placement="top"
                      enterDelay={0}
                      leaveDelay={0}
                    >
                      {plotChannel.options.visible ? (
                        <IconButton
                          color="primary"
                          aria-label={`Toggle ${plotChannel.name} visibility off`}
                          size="small"
                          sx={{ paddingTop: '0', paddingBottom: '0' }}
                          onClick={() =>
                            toggleChannelVisibility(plotChannel.name)
                          }
                        >
                          <Visibility sx={{ color: 'black' }} />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="primary"
                          aria-label={`Toggle ${plotChannel.name} visibility on`}
                          size="small"
                          sx={{ paddingTop: '0', paddingBottom: '0' }}
                          onClick={() =>
                            toggleChannelVisibility(plotChannel.name)
                          }
                        >
                          <VisibilityOff sx={{ color: 'black' }} />
                        </IconButton>
                      )}
                    </Tooltip>
                    <Tooltip
                      title="Change line style"
                      arrow
                      placement="top"
                      enterDelay={0}
                      leaveDelay={0}
                    >
                      <IconButton
                        color="primary"
                        aria-label={`Change ${plotChannel.name} line style`}
                        size="small"
                        sx={{ paddingTop: '0', paddingBottom: '0' }}
                        onClick={() => toggleChannelLineStyle(plotChannel.name)}
                      >
                        <LineStyle sx={{ color: 'black' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title="Remove from plot"
                      arrow
                      placement="top"
                      enterDelay={0}
                      leaveDelay={0}
                    >
                      <StyledClose
                        aria-label={`Remove ${plotChannel.name} from plot`}
                        onClick={() => removePlotChannel(plotChannel.name)}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Grid>
    </Grid>
  );
};

export default PlotSettings;
