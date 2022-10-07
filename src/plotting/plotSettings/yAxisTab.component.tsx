import React from 'react';
import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  styled,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Search,
  Close,
  Visibility,
  VisibilityOff,
  LineStyle,
} from '@mui/icons-material';
import ColourPicker from './colourPicker.component';
import {
  FullScalarChannelMetadata,
  SelectedPlotChannel,
  YAxesScale,
} from '../../app.types';

const StyledClose = styled(Close)(() => ({
  cursor: 'pointer',
  color: 'black',
  '&:hover': {
    color: 'red',
  },
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

export interface YAxisTabProps {
  selectedRecordTableChannels: FullScalarChannelMetadata[];
  allChannels: FullScalarChannelMetadata[];
  selectedPlotChannels: SelectedPlotChannel[];
  changeSelectedPlotChannels: (
    selectedPlotChannels: SelectedPlotChannel[]
  ) => void;
  changeYMinimum: (value: number | undefined) => void;
  changeYMaximum: (value: number | undefined) => void;
  YAxesScale: YAxesScale;
  changeYAxesScale: (YAxesScale: YAxesScale) => void;
}

const YAxisTab = (props: YAxisTabProps) => {
  const {
    selectedRecordTableChannels,
    allChannels,
    selectedPlotChannels,
    changeSelectedPlotChannels,
    changeYMinimum,
    changeYMaximum,
    YAxesScale,
    changeYAxesScale,
  } = props;

  const colourGenerator = React.useMemo(() => {
    return new ColourGenerator();
  }, []);

  // We define these as strings so the user can type decimal points
  // We then attempt to parse numbers from them whenever their values change
  const [yMinimum, setYMinimum] = React.useState<string>('');
  const [yMaximum, setYMaximum] = React.useState<string>('');

  const invalidYRange = parseFloat(yMinimum) > parseFloat(yMaximum);

  const [autocompleteValue, setAutocompleteValue] = React.useState<string>('');
  const [selectValue, setSelectValue] = React.useState<string>('');

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

  const handleChangeYScale = React.useCallback(
    (value: string) => {
      changeYAxesScale(value as YAxesScale);
    },
    [changeYAxesScale]
  );

  const addPlotChannel = React.useCallback(
    (channelName: string) => {
      const newSelectedPlotChannel: SelectedPlotChannel = {
        name: channelName,
        options: {
          visible: true,
          lineStyle: 'solid',
          colour: colourGenerator.nextColour(), // Generate a colour for the channel to appear in the plot
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

  const toggleChannelLineStyle = React.useCallback(
    (channelName: string) => {
      const newSelectedChannelsArray = Array.from(selectedPlotChannels);
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
      changeSelectedPlotChannels(newSelectedChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels]
  );

  return (
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
            value={YAxesScale}
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
            <Tooltip
              title={plotChannel.name}
              arrow
              placement="top"
              leaveDelay={0}
            >
              <Typography maxWidth="150" noWrap>
                {plotChannel.name}
              </Typography>
            </Tooltip>
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
                    onClick={() => toggleChannelVisibility(plotChannel.name)}
                  >
                    <Visibility sx={{ color: 'black' }} />
                  </IconButton>
                ) : (
                  <IconButton
                    color="primary"
                    aria-label={`Toggle ${plotChannel.name} visibility on`}
                    size="small"
                    sx={{ paddingTop: '0', paddingBottom: '0' }}
                    onClick={() => toggleChannelVisibility(plotChannel.name)}
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
              <ColourPicker
                channelName={plotChannel.name}
                colour={plotChannel.options.colour}
                changeColour={changeChannelColour}
              />
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
  );
};

export default YAxisTab;
