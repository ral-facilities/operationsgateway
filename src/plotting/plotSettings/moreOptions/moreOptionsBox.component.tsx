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
import NumberInput from './numberInput.component';
import {
  LineStyle,
  MarkerStyle,
  SelectedPlotChannel,
} from '../../../app.types';
import { deepCopySelectedPlotChannels } from '../../util';

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
  const MARKER_STYLE_VALUES: MarkerStyle[] = [
    'circle',
    'cross',
    'crossRot',
    'dash',
    'line',
    'rect',
    'rectRounded',
    'rectRot',
    'star',
    'triangle',
    false,
  ];

  const toggleChannelVisibility = React.useCallback(() => {
    const newSelectedPlotChannelsArray =
      deepCopySelectedPlotChannels(selectedPlotChannels);
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
      const newSelectedPlotChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
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

  const changeChannelMarkerColour = React.useCallback(
    (selectedColour: string) => {
      const newSelectedPlotChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((currentChannel) => {
        if (currentChannel.name === thisChannel.name) {
          currentChannel.options.markerColour =
            selectedColour === '' ? undefined : selectedColour;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels, thisChannel.name]
  );

  const changeChannelLineStyle = React.useCallback(
    (chosenStyle: LineStyle) => {
      const newSelectedChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
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

  const changeChannelLineWidth = React.useCallback(
    (newWidth: number) => {
      const newSelectedChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
      newSelectedChannelsArray.some((currentChannel) => {
        if (currentChannel.name === thisChannel.name) {
          currentChannel.options.lineWidth = newWidth;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels, thisChannel.name]
  );

  const changeChannelMarkerStyle = React.useCallback(
    (chosenStyle: MarkerStyle) => {
      const newSelectedChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
      newSelectedChannelsArray.some((currentChannel) => {
        if (currentChannel.name === thisChannel.name) {
          currentChannel.options.markerStyle = chosenStyle;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels, thisChannel.name]
  );

  const changeChannelMarkerSize = React.useCallback(
    (newSize: number) => {
      const newSelectedChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
      newSelectedChannelsArray.some((currentChannel) => {
        if (currentChannel.name === thisChannel.name) {
          currentChannel.options.markerSize = newSize;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels, thisChannel.name]
  );

  const changeChannelAxis = React.useCallback(
    (yAxis: SelectedPlotChannel['options']['yAxis']) => {
      const newSelectedPlotChannelsArray =
        deepCopySelectedPlotChannels(selectedPlotChannels);
      newSelectedPlotChannelsArray.some((channel) => {
        if (channel.name === thisChannel.name) {
          channel.options.yAxis = yAxis;
          return true;
        }
        return false;
      });
      changeSelectedPlotChannels(newSelectedPlotChannelsArray);
    },
    [changeSelectedPlotChannels, selectedPlotChannels, thisChannel.name]
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
            aria-label={`toggle ${
              thisChannel.displayName ?? thisChannel.name
            } visibility ${thisChannel.options.visible ? 'off' : 'on'}`}
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
          <Typography sx={{ fontSize: 12 }}>Line width</Typography>
          <NumberInput
            min={1}
            max={10}
            value={thisChannel.options.lineWidth ?? 3}
            onChange={(_event, newValue) =>
              newValue && changeChannelLineWidth(newValue)
            }
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
          <Typography sx={{ fontSize: 12 }}>Markers</Typography>
          <NativeSelect
            value={thisChannel.options.markerStyle}
            onChange={(event) => {
              const newValue =
                event.target.value === 'false' ? false : event.target.value;
              changeChannelMarkerStyle(newValue as MarkerStyle);
            }}
            sx={{ fontSize: 12, width: 70 }}
            inputProps={{
              'aria-label': `change ${
                thisChannel.displayName ?? thisChannel.name
              } marker style`,
            }}
          >
            {MARKER_STYLE_VALUES.map((style) => {
              if (!style) {
                return (
                  <option key="none" value={'false'}>
                    None
                  </option>
                );
              }
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
          <Typography sx={{ fontSize: 12 }}>Marker size</Typography>
          <NumberInput
            min={1}
            max={10}
            value={thisChannel.options.markerSize ?? 3}
            onChange={(_event, newValue) =>
              newValue && changeChannelMarkerSize(newValue)
            }
            disabled={thisChannel.options.markerStyle === false}
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
          <Typography sx={{ fontSize: 12 }}>Colour</Typography>
          <ColourPicker
            channelName={thisChannel.displayName ?? thisChannel.name}
            colour={thisChannel.options.colour}
            changeColour={changeChannelColour}
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
          <Typography sx={{ fontSize: 12 }}>Marker colour</Typography>
          <ColourPicker
            channelName={thisChannel.displayName ?? thisChannel.name}
            colour={
              thisChannel.options.markerColour ?? thisChannel.options.colour
            }
            changeColour={changeChannelMarkerColour}
            marker={true}
            sameAsLine={thisChannel.options.markerColour === undefined}
          />
        </Box>
      </Grid>
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
    </div>
  );
};

export default MoreOptionsBox;
