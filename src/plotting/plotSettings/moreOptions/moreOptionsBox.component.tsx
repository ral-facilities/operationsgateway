import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid2 as Grid,
  NativeSelect,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  LineStyle,
  MarkerStyle,
  SelectedPlotChannel,
} from '../../../app.types';
import { deepCopySelectedPlotChannels } from '../../util';
import ColourPicker from './colourPicker.component';

export interface MoreOptionsProps {
  channel: SelectedPlotChannel;
  selectedPlotChannels: SelectedPlotChannel[];
  changeSelectedPlotChannels: (
    selectedPlotChannels: SelectedPlotChannel[]
  ) => void;
}

const MoreOptionsBox = (props: MoreOptionsProps) => {
  const {
    channel: thisChannel,
    selectedPlotChannels,
    changeSelectedPlotChannels,
  } = props;

  const LINE_STYLE_VALUES: LineStyle[] = ['solid', 'dash', 'dot'];
  const MARKER_STYLE_VALUES: Record<string, MarkerStyle> = {
    circle: 'circle',
    square: 'square',
    triangle: 'triangle-up',
    diamond: 'diamond',
    cross: 'cross-thin',
    x: 'x-thin',
    line: 'line-ew',
    star: 'star',
    asterisk: 'asterisk',
    none: false,
  };

  const changeChannelOption = React.useCallback(
    <K extends keyof SelectedPlotChannel['options']>(
      option: K,
      newValue: SelectedPlotChannel['options'][K]
    ) => {
      const newSelectedPlotChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((currentChannel) => {
        if (currentChannel.name === thisChannel.name) {
          currentChannel.options[option] = newValue;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, thisChannel.name, selectedPlotChannels]
  );

  return (
    <Grid container>
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: '0px 0px 0px 8px',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 12 }}>Visible</Typography>
          <Switch
            size="small"
            checked={thisChannel.options.visible}
            aria-label={`toggle ${
              thisChannel.displayName ?? thisChannel.name
            } visibility ${thisChannel.options.visible ? 'off' : 'on'}`}
            sx={{ m: 1 }}
            onChange={() =>
              changeChannelOption('visible', !thisChannel.options.visible)
            }
          />
        </Box>
      </Grid>
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 12 }}>Line style</Typography>
          <NativeSelect
            value={thisChannel.options.lineStyle}
            onChange={(event) => {
              const newValue = event.target.value;
              changeChannelOption('lineStyle', newValue as LineStyle);
            }}
            sx={{ fontSize: 12, width: 70 }}
            inputProps={{
              'aria-label': `change ${
                thisChannel.displayName ?? thisChannel.name
              } line style`,
            }}
          >
            {LINE_STYLE_VALUES.map((style) => {
              const capitalised =
                style.charAt(0).toUpperCase() + style.slice(1);
              return (
                <option key={style} value={style}>
                  {capitalised}
                </option>
              );
            })}
          </NativeSelect>
        </Box>
      </Grid>
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 12 }}>Line width</Typography>
          <TextField
            name="line width"
            value={thisChannel.options.lineWidth ?? 3}
            type="number"
            sx={{
              '& .MuiInputBase-input': {
                width: 36,
                fontSize: '0.9rem',
                padding: '3px 3px 3px 8px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.5rem',
              },
            }}
            size="small"
            slotProps={{
              htmlInput: {
                min: 1,
                max: 10,
                'aria-label': `change ${thisChannel.displayName ?? thisChannel.name} line width`,
              },
            }}
            onFocus={(event) => {
              event.target.select();
            }}
            onChange={(event) => {
              let newValue = parseInt(event.target.value);
              if (newValue < 1) {
                newValue = 1;
              } else if (newValue > 10) {
                newValue = 10;
              }
              changeChannelOption('lineWidth', newValue);
            }}
          />
        </Box>
      </Grid>
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 12 }}>Markers</Typography>
          <NativeSelect
            value={thisChannel.options.markerStyle}
            onChange={(event) => {
              const newValue =
                event.target.value === 'false' ? false : event.target.value;
              changeChannelOption('markerStyle', newValue as MarkerStyle);
            }}
            sx={{ fontSize: 12, width: 70 }}
            inputProps={{
              'aria-label': `change ${
                thisChannel.displayName ?? thisChannel.name
              } marker style`,
            }}
          >
            {Object.entries(MARKER_STYLE_VALUES).map(
              ([styleDisplayName, styleValue]) => {
                const capitalised =
                  styleDisplayName.charAt(0).toUpperCase() +
                  styleDisplayName.slice(1);
                return (
                  <option
                    key={styleDisplayName}
                    value={styleValue === false ? 'false' : styleValue}
                  >
                    {capitalised}
                  </option>
                );
              }
            )}
          </NativeSelect>
        </Box>
      </Grid>
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 12 }}>Marker size</Typography>
          <TextField
            name="marker size"
            value={thisChannel.options.markerSize ?? 3}
            type="number"
            sx={{
              '& .MuiInputBase-input': {
                width: 36,
                fontSize: '0.9rem',
                padding: '3px 3px 3px 8px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.5rem',
              },
            }}
            size="small"
            slotProps={{
              htmlInput: {
                min: 1,
                max: 15,
                'aria-label': `change ${thisChannel.displayName ?? thisChannel.name} marker size`,
              },
            }}
            onFocus={(event) => {
              event.target.select();
            }}
            onChange={(event) => {
              let newValue = parseInt(event.target.value);
              if (newValue < 1) {
                newValue = 1;
              } else if (newValue > 15) {
                newValue = 15;
              }
              changeChannelOption('markerSize', newValue);
            }}
          />
        </Box>
      </Grid>
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 12 }}>Colour</Typography>
          <ColourPicker
            channelName={thisChannel.displayName ?? thisChannel.name}
            colour={thisChannel.options.colour}
            changeColour={(newColour: string) =>
              changeChannelOption('colour', newColour)
            }
          />
        </Box>
      </Grid>
      <Grid size={12}>
        <FormControl
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
            alignItems: 'center',
          }}
        >
          <FormLabel sx={{ fontSize: 12, color: 'inherit' }} id="y-axis-label">
            Y Axis
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="y-axis-label"
            name="y-axis-label-radio-buttons"
            value={thisChannel.options.yAxis}
            onChange={(event) => {
              const newValue = event.target.value;
              changeChannelOption(
                'yAxis',
                newValue as SelectedPlotChannel['options']['yAxis']
              );
            }}
          >
            <FormControlLabel
              value="left"
              control={<Radio size="small" sx={{ padding: '2px' }} />}
              label="Left"
              slotProps={{ typography: { sx: { fontSize: 12 } } }}
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              value="right"
              control={<Radio size="small" sx={{ padding: '2px' }} />}
              label="Right"
              slotProps={{ typography: { sx: { fontSize: 12 } } }}
              sx={{ margin: 0 }}
            />
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default MoreOptionsBox;
