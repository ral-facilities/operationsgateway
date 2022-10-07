import React from 'react';
import { Box, FormControlLabel, Grid, IconButton, Switch } from '@mui/material';
import { LineStyle } from '@mui/icons-material';
import ColourPicker from './colourPicker.component';
import { SelectedPlotChannel } from '../../app.types';

export interface MoreOptionsProps {
  channel: SelectedPlotChannel;
  selectedPlotChannels: SelectedPlotChannel[];
  changeSelectedPlotChannels: (
    selectedPlotChannels: SelectedPlotChannel[]
  ) => void;
}

const MoreOptions = (props: MoreOptionsProps) => {
  const {
    channel: thisChannel,
    selectedPlotChannels,
    changeSelectedPlotChannels,
  } = props;

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

  const toggleChannelLineStyle = React.useCallback(() => {
    const newSelectedChannelsArray = Array.from(selectedPlotChannels);
    newSelectedChannelsArray.some((currentChannel) => {
      if (currentChannel.name === thisChannel.name) {
        if (thisChannel.options.lineStyle === 'solid')
          currentChannel.options.lineStyle = 'dashed';
        else if (currentChannel.options.lineStyle === 'dashed')
          currentChannel.options.lineStyle = 'dotted';
        else currentChannel.options.lineStyle = 'solid';
        return true;
      }
      return false;
    });
    changeSelectedPlotChannels(newSelectedChannelsArray);
  }, [
    changeSelectedPlotChannels,
    thisChannel.name,
    thisChannel.options.lineStyle,
    selectedPlotChannels,
  ]);

  return (
    <div>
      <Grid container item key={thisChannel.name}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={thisChannel.options.visible}
                sx={{ m: 1 }}
              />
            }
            label="Visible"
            labelPlacement="start"
            onChange={() => toggleChannelVisibility()}
          />
        </Box>
      </Grid>
      <Grid container item key={thisChannel.name}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
          }}
        >
          <FormControlLabel
            control={
              <IconButton
                color="primary"
                aria-label={`Change ${thisChannel.name} line style`}
                size="small"
                sx={{ paddingTop: '0', paddingBottom: '0' }}
                onClick={() => toggleChannelLineStyle()}
              >
                <LineStyle sx={{ color: 'black' }} />
              </IconButton>
            }
            label="Line style"
            labelPlacement="start"
          />
        </Box>
      </Grid>
      <Grid container item key={thisChannel.name}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'inherit',
            justifyContent: 'space-between',
            border: 1,
            padding: 1,
          }}
        >
          <FormControlLabel
            control={
              <ColourPicker
                channelName={thisChannel.name}
                colour={thisChannel.options.colour}
                changeColour={changeChannelColour}
              />
            }
            label="Colour"
            labelPlacement="start"
          />
        </Box>
      </Grid>
    </div>
  );
};

export default MoreOptions;
