import React from 'react';
import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
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
import { Search, Close } from '@mui/icons-material';
import MoreOptionsToggle from './moreOptions/moreOptionsToggle.component';
import {
  FullScalarChannelMetadata,
  SelectedPlotChannel,
  YAxesScale,
} from '../../app.types';
import ColourGenerator from './colourGenerator';

const StyledClose = styled(Close)(() => ({
  cursor: 'pointer',
  color: 'black',
  '&:hover': {
    color: 'red',
  },
}));

export interface YAxisTabProps {
  selectedRecordTableChannels: FullScalarChannelMetadata[];
  allChannels: FullScalarChannelMetadata[];
  selectedPlotChannels: SelectedPlotChannel[];
  changeSelectedPlotChannels: (
    selectedPlotChannels: SelectedPlotChannel[]
  ) => void;
  initialYMinimum?: number;
  initialYMaximum?: number;
  changeYMinimum: (value: number | undefined) => void;
  changeYMaximum: (value: number | undefined) => void;
  YAxesScale: YAxesScale;
  changeYAxesScale: (YAxesScale: YAxesScale) => void;
  initialSelectedColours: string[];
  initialRemainingColours: string[];
  changeSelectedColours: (selected: string[]) => void;
  changeRemainingColours: (remaining: string[]) => void;
}

const YAxisTab = (props: YAxisTabProps) => {
  const {
    selectedRecordTableChannels,
    allChannels,
    selectedPlotChannels,
    changeSelectedPlotChannels,
    initialYMinimum,
    initialYMaximum,
    changeYMinimum,
    changeYMaximum,
    YAxesScale,
    changeYAxesScale,
    initialSelectedColours,
    initialRemainingColours,
    changeSelectedColours,
    changeRemainingColours,
  } = props;

  const colourGenerator = React.useMemo(() => {
    return new ColourGenerator(initialSelectedColours, initialRemainingColours);
  }, [initialRemainingColours, initialSelectedColours]);

  // We define these as strings so the user can type decimal points
  // We then attempt to parse numbers from them whenever their values change
  const [yMinimum, setYMinimum] = React.useState<string>(
    initialYMinimum ? '' + initialYMinimum : ''
  );
  const [yMaximum, setYMaximum] = React.useState<string>(
    initialYMaximum ? '' + initialYMaximum : ''
  );

  const invalidYRange = parseFloat(yMinimum) > parseFloat(yMaximum);

  const [autocompleteValue, setAutocompleteValue] = React.useState<string>('');
  const [selectValue, setSelectValue] = React.useState<string>('');

  React.useEffect(() => {
    if (yMinimum && parseFloat(yMinimum)) {
      changeYMinimum(parseFloat(yMinimum));
    } else {
      changeYMinimum(undefined);
    }
  }, [changeYMinimum, yMinimum]);

  React.useEffect(() => {
    if (yMaximum && parseFloat(yMaximum)) {
      changeYMaximum(parseFloat(yMaximum));
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
          yAxis: 'left',
        },
      };

      // Only need to shallow copy here
      const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
      newSelectedPlotChannelsArray.push(newSelectedPlotChannel);
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
      changeSelectedColours(colourGenerator.getSelectedColours());
      changeRemainingColours(colourGenerator.getRemainingColours());
    },
    [
      changeRemainingColours,
      changeSelectedColours,
      changeSelectedPlotChannels,
      colourGenerator,
      selectedPlotChannels,
    ]
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
      changeSelectedColours(colourGenerator.getSelectedColours());
      changeRemainingColours(colourGenerator.getRemainingColours());

      // Reset to a linear scale if no channels are selected
      if (newSelectedPlotChannelsArray.length === 0) {
        handleChangeYScale('linear');
      }
    },
    [
      changeRemainingColours,
      changeSelectedColours,
      changeSelectedPlotChannels,
      colourGenerator,
      handleChangeYScale,
      selectedPlotChannels,
    ]
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
              <Typography maxWidth="208" noWrap>
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
              <MoreOptionsToggle
                channel={plotChannel}
                selectedPlotChannels={selectedPlotChannels}
                changeSelectedPlotChannels={changeSelectedPlotChannels}
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
