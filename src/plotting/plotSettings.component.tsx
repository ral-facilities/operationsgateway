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
} from '@mui/material';
import {
  ScatterPlot,
  ShowChart,
  Search,
  Close,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  XAxisSettings,
  YAxisSettings,
  FullScalarChannelMetadata,
  PlotType,
  SelectedPlotChannel,
} from '../app.types';

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
  } = props;
  const { scale: XScale } = XAxisSettings;
  const { scale: YScale } = YAxesSettings;

  const [title, setTitle] = React.useState('');
  const deferredTitle = React.useDeferredValue(title);

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

  const addPlotChannel = React.useCallback(
    (channelName: string) => {
      const newSelectedChannel: SelectedPlotChannel = {
        name: channelName,
        options: {
          visible: true,
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
              {/* TODO: hook these up */}
              <Grid item xs={6}>
                <TextField
                  label="Min"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
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
                />
              </Grid>
            </Grid>
            <Grid item>
              <FormControl
                disabled={XAxisSettings.scale === 'time'}
                sx={{ flexDirection: 'row', alignItems: 'center' }}
                // TODO: this needs to be enabled for all non-time X axes
                // and we need to make sure we set XAxisSettings.scale to time
                // when a user selects Time, and to linear (default) when they don't
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
                    value="log"
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
              {/* TODO: hook these up */}
              <Grid item xs={6}>
                <TextField
                  label="Min"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
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
                    value="log"
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
                  <Typography maxWidth="205" noWrap>
                    {plotChannel.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                    }}
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
                    <StyledClose
                      aria-label={`Remove ${plotChannel.name} from y-axis`}
                      onClick={() => removePlotChannel(plotChannel.name)}
                    />
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
