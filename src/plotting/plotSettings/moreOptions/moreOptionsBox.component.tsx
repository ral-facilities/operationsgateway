import React from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  NativeSelect,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material';
import ColourPicker from './colourPicker.component';
import { LineStyle, SelectedPlotChannel } from '../../../app.types';

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

  const LINE_STYLE_VALUES: LineStyle[] = ['solid', 'dashed', 'dotted'];

  const toggleChannelVisibility = React.useCallback(() => {
    const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
    newSelectedPlotChannelsArray.some((currentChannel) => {
      if (currentChannel.name === thisChannel.name) {
        currentChannel.options.visible = !currentChannel.options.visible;
        return true;
      }
      return false;
    });
    changeSelectedPlotChannels(newSelectedPlotChannelsArray);
  }, [changeSelectedPlotChannels, thisChannel.name, selectedPlotChannels]);

  const changeChannelColour = React.useCallback(
    (selectedColour: string) => {
      const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((currentChannel) => {
        if (currentChannel.name === thisChannel.name) {
          currentChannel.options.colour = selectedColour;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, thisChannel.name, selectedPlotChannels]
  );

  const changeChannelLineStyle = React.useCallback(
    (chosenStyle: LineStyle) => {
      const newSelectedChannelsArray = Array.from(selectedPlotChannels);
      newSelectedChannelsArray.some((currentChannel) => {
        if (currentChannel.name === thisChannel.name) {
          currentChannel.options.lineStyle = chosenStyle;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedChannelsArray);
    },
    [selectedPlotChannels, changeSelectedPlotChannels, thisChannel.name]
  );

  const changeChannelAxis = React.useCallback(
    (yAxis: SelectedPlotChannel['options']['yAxis']) => {
      const newSelectedPlotChannelsArray = Array.from(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((channel) => {
        if (channel.name === thisChannel.name) {
          channel.options.yAxis = yAxis;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels]
  );

  return (
    <div>
      <Grid container item>
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
            aria-label={`toggle ${thisChannel.name} visibility ${
              thisChannel.options.visible ? 'off' : 'on'
            }`}
            sx={{ m: 1 }}
            onChange={() => toggleChannelVisibility()}
          />
        </Box>
      </Grid>
      <Grid container item>
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
              changeChannelLineStyle(newValue as LineStyle);
            }}
            sx={{ fontSize: 12, width: 70 }}
            inputProps={{
              'aria-label': `change ${thisChannel.name} line style`,
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
      <Grid container item>
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
            channelName={thisChannel.name}
            colour={thisChannel.options.colour}
            changeColour={changeChannelColour}
          />
        </Box>
        <Grid container item>
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
            <FormLabel
              sx={{ fontSize: 12, color: 'inherit' }}
              id="y-axis-label"
            >
              Y Axis
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="y-axis-label"
              name="y-axis-label-radio-buttons"
              value={thisChannel.options.yAxis}
              onChange={(event) => {
                const newValue = event.target.value;
                changeChannelAxis(
                  newValue as SelectedPlotChannel['options']['yAxis']
                );
              }}
            >
              <FormControlLabel
                value="left"
                control={<Radio size="small" sx={{ padding: '2px' }} />}
                label="Left"
                componentsProps={{ typography: { sx: { fontSize: 12 } } }}
                sx={{ margin: 0 }}
              />
              <FormControlLabel
                value="right"
                control={<Radio size="small" sx={{ padding: '2px' }} />}
                label="Right"
                componentsProps={{ typography: { sx: { fontSize: 12 } } }}
                sx={{ margin: 0 }}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
};

export default MoreOptionsBox;
