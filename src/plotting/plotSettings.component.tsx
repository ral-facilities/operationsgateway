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
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ScatterPlot,
  ShowChart,
  Search,
  Close,
  Visibility,
  VisibilityOff,
  MultipleStop,
} from '@mui/icons-material';
import {
  XAxisSettings,
  YAxisSettings,
  FullScalarChannelMetadata,
  PlotType,
  SelectedPlotChannel,
} from '../app.types';
import ColourPicker from './colourPicker.component';

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

/**
 * Handles the colours currently in use for plotting different channels
 * Determines which colours we have available based on which have already been selected
 * Uses a list of 10 pre-selected colours before generating a random colour beyond this
 */
export class ColourGenerator {
  selectedColours: string[];
  remainingColours: string[];

  // List of colours to generate in order (taken from eCat)
  colourOrder: string[] = [
    '#008000', // dark green
    '#0000ff', // dark blue
    '#ff00ff', // pink
    '#00ffff', // light blue
    '#008080', // teal
    '#800000', // deep red
    '#00ff00', // light green
    '#000080', // navy blue
    '#7f8000', // brown-ish yellow?
    '#80007f', // indigo
  ];

  constructor() {
    this.selectedColours = [];
    this.remainingColours = Array.from(this.colourOrder);
  }

  /**
   * Generates a random hex colour
   * Called when we have no remaining pre-selected colours to return
   * @returns a random hex colour value
   */
  randomColour() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Provides the next colour in the list of remaining colours
   * @returns the colour to display
   */
  nextColour() {
    if (!this.remainingColours.length) return this.randomColour();

    const returningColour =
      this.remainingColours.shift() ?? this.randomColour(); // .shift() should always return a value but the compiler wasn't satisfied without a way out of returning undefined
    this.selectedColours.push(returningColour); // Add the next colour to the list of selected colours
    return returningColour;
  }

  /**
   * Handles removing a colour from the list of selected colours
   * The removed colour is inserted back into its original place in the remaining colours list
   * This ensures the colour at position *n* is always the *n*th colour returned
   * @param removedColour the colour to remove
   */
  removeColour(removedColour: string) {
    const selectedIndex = this.selectedColours.indexOf(removedColour);
    if (selectedIndex === -1) return;

    // Modify the selectedColours list to keep the other colours
    this.selectedColours.splice(selectedIndex, 1);

    // See if the removed colour is in the list of pre-determined colours
    const indexOfRemoved = this.colourOrder.indexOf(removedColour);
    if (indexOfRemoved !== -1) {
      let inserted = false;

      // Loop through the remaining colours
      for (let i = 0; i < this.remainingColours.length; i++) {
        const currentRemainingColour = this.remainingColours[i];
        const indexOfCurrent = this.colourOrder.indexOf(currentRemainingColour);

        // If the current remaining colour appears after the colour to be removed
        if (indexOfCurrent > indexOfRemoved) {
          // Insert the colour to be removed before the current remaining colour
          this.remainingColours.splice(i, 0, removedColour);
          inserted = true;
          break;
        }
      }

      // Removed colour was the last pre-determined colour so add it to the end of remaining colours list
      if (!inserted) this.remainingColours.push(removedColour);
    }
  }
}

export interface PlotSettingsProps {
  selectedRecordTableChannels: FullScalarChannelMetadata[];
  allChannels: FullScalarChannelMetadata[];
  changePlotTitle: (title: string) => void;
  plotType: PlotType;
  changePlotType: (plotType: PlotType) => void;
  XAxis: string;
  changeXAxis: (value: string) => void;
  XAxisSettings: XAxisSettings;
  changeXAxisSettings: (XAxisSettings: XAxisSettings) => void;
  YAxesSettings: YAxisSettings;
  changeYAxesSettings: (YAxesSettings: YAxisSettings) => void;
  selectedPlotChannels: SelectedPlotChannel[];
  changeSelectedPlotChannels: (
    selectedPlotChannels: SelectedPlotChannel[]
  ) => void;
}

const PlotSettings = (props: PlotSettingsProps) => {
  const {
    selectedRecordTableChannels,
    allChannels,
    changePlotTitle,
    plotType,
    changePlotType,
    XAxis,
    changeXAxis,
    XAxisSettings,
    changeXAxisSettings,
    YAxesSettings,
    changeYAxesSettings,
    selectedPlotChannels,
    changeSelectedPlotChannels,
  } = props;
  const { scale: XScale } = XAxisSettings;
  const { scale: YScale } = YAxesSettings;

  const [title, setTitle] = React.useState('');
  const deferredTitle = React.useDeferredValue(title);

  const [XAxisInputVal, setXAxisInputVal] = React.useState<string>('');
  const [autocompleteValue, setAutocompleteValue] = React.useState<string>('');
  const [selectValue, setSelectValue] = React.useState<string>('');

  const handleChangeTitle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
  );

  const colourGenerator = React.useMemo(() => {
    return new ColourGenerator();
  }, []);

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
      const newSelectedPlotChannel: SelectedPlotChannel = {
        name: channelName,
        options: {
          visible: true,
          colour: colourGenerator.nextColour(), // Generate a colour for the channel to appear in the plot
          yAxis: 'left',
        },
      };

      const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
      newSelectedPlotChannelsArray.push(newSelectedPlotChannel);
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, colourGenerator, selectedPlotChannels]
  );

  const removePlotChannel = React.useCallback(
    (channelName: string) => {
      // Extracting channel to remove its plot colour from the generator's list
      const channelToRemove = selectedPlotChannels.find(
        (channel) => channel.name === channelName
      );
      if (!channelToRemove) return;

      colourGenerator.removeColour(channelToRemove.options.colour);

      // Filter out the channel to remove
      const newSelectedPlotChannelsArray = selectedPlotChannels.filter(
        (channel) => channel.name !== channelName
      );

      // Update the list of selected channels
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);

      // Reset to a linear scale if no channels are selected
      if (newSelectedPlotChannelsArray.length === 0) {
        handleChangeYScale('linear');
      }
    },
    [
      changeSelectedPlotChannels,
      colourGenerator,
      handleChangeYScale,
      selectedPlotChannels,
    ]
  );

  const toggleChannelVisibility = React.useCallback(
    (channelName: string) => {
      const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((channel) => {
        if (channel.name === channelName) {
          channel.options.visible = !channel.options.visible;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels]
  );

  const changeChannelColour = React.useCallback(
    (channelName: string, selectedColour: string) => {
      const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((channel) => {
        if (channel.name === channelName) {
          channel.options.colour = selectedColour;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels]
  );

  const toggleChannelAxis = React.useCallback(
    (channelName: string) => {
      const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((channel) => {
        if (channel.name === channelName) {
          channel.options.yAxis =
            channel.options.yAxis === 'left' ? 'right' : 'left';
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels]
  );

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
                    value="logarithmic"
                    control={<Radio />}
                    label="Log"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid container item>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: 12 }}>
                  Displayed table channels
                </InputLabel>
                <Select
                  label="Displayed table channels"
                  value={selectValue}
                  onChange={(event) => {
                    const newValue = event.target.value;
                    addPlotChannel(newValue);
                    setSelectValue('');
                  }}
                  sx={{ fontSize: 12 }}
                  inputProps={{
                    'data-testid': 'select displayed table channels',
                  }}
                >
                  {selectedRecordTableChannels
                    .filter((channel) => channel.systemName !== 'timestamp')
                    .filter(
                      (selected) =>
                        !selectedPlotChannels
                          .map((channel) => channel.name)
                          .includes(selected.systemName)
                    )
                    .map((channel) => {
                      const name = channel.systemName;
                      return (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Grid>
            <Grid container item>
              <Autocomplete
                disablePortal
                freeSolo
                clearOnBlur
                id="select data channels"
                options={allChannels
                  .map((channel) => channel.systemName)
                  .filter(
                    (name) =>
                      name !== 'timestamp' &&
                      !selectedPlotChannels
                        .map((channel) => channel.name)
                        .includes(name)
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
            {selectedPlotChannels.map((plotChannel) => (
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
                  <Typography maxWidth="179" noWrap>
                    {plotChannel.name}
                  </Typography>
                  <Box
                    sx={
                      // for some reason, styling these buttons in a row causes webkit
                      // headless playwright e2e tests on linux to fail - so disable this styling in e2e builds
                      /* istanbul ignore next */
                      process.env.REACT_APP_E2E_TESTING
                        ? {}
                        : {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }
                    }
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
                    <IconButton
                      color="primary"
                      aria-label={`Switch ${plotChannel.name} axis`}
                      size="small"
                      sx={{ paddingTop: '0', paddingBottom: '0' }}
                      onClick={() => toggleChannelAxis(plotChannel.name)}
                    >
                      <MultipleStop sx={{ color: 'black' }} />
                    </IconButton>
                    <ColourPicker
                      channelName={plotChannel.name}
                      colour={plotChannel.options.colour}
                      changeColour={changeChannelColour}
                    />
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
