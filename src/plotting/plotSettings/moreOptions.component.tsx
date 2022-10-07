import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LineStyle, Visibility, VisibilityOff } from '@mui/icons-material';
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
  const { channel, selectedPlotChannels, changeSelectedPlotChannels } = props;

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
    <div>
      <Tooltip
        title="Toggle visibility"
        arrow
        placement="top"
        enterDelay={0}
        leaveDelay={0}
      >
        {channel.options.visible ? (
          <IconButton
            color="primary"
            aria-label={`Toggle ${channel.name} visibility off`}
            size="small"
            sx={{ paddingTop: '0', paddingBottom: '0' }}
            onClick={() => toggleChannelVisibility(channel.name)}
          >
            <Visibility sx={{ color: 'black' }} />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            aria-label={`Toggle ${channel.name} visibility on`}
            size="small"
            sx={{ paddingTop: '0', paddingBottom: '0' }}
            onClick={() => toggleChannelVisibility(channel.name)}
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
          aria-label={`Change ${channel.name} line style`}
          size="small"
          sx={{ paddingTop: '0', paddingBottom: '0' }}
          onClick={() => toggleChannelLineStyle(channel.name)}
        >
          <LineStyle sx={{ color: 'black' }} />
        </IconButton>
      </Tooltip>
      <ColourPicker
        channelName={channel.name}
        colour={channel.options.colour}
        changeColour={changeChannelColour}
      />
    </div>
  );
};

export default MoreOptions;
