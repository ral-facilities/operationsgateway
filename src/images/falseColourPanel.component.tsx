import React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Switch,
} from '@mui/material';
import { FalseColourParams, useColourBar, useColourMaps } from '../api/images';

const marks = [
  {
    value: 0,
    label: '0',
  },
  {
    value: 31,
  },
  {
    value: 63,
    label: '63',
  },
  {
    value: 95,
  },
  {
    value: 127,
    label: '127',
  },
  {
    value: 159,
  },
  {
    value: 191,
    label: '191',
  },
  {
    value: 223,
  },
  {
    value: 255,
    label: '255',
  },
];

interface FalseColourPanelProps extends FalseColourParams {
  changeColourMap: (colourMap: string | undefined) => void;
  changeLowerLevel: (value: number | undefined) => void;
  changeUpperLevel: (value: number | undefined) => void;
}

const FalseColourPanel = (props: FalseColourPanelProps) => {
  const {
    colourMap,
    lowerLevel,
    upperLevel,
    changeColourMap,
    changeLowerLevel,
    changeUpperLevel,
  } = props;

  const handleColourMapChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value as string;
    setSelectColourMap(newValue);
    changeColourMap(newValue !== '' ? newValue : undefined);
  };

  const { data: colourMaps } = useColourMaps();
  const { data: colourBar } = useColourBar({
    colourMap: colourMap,
    lowerLevel: lowerLevel,
    upperLevel: upperLevel,
  });

  const [enabled, setEnabled] = React.useState(true);
  const [sliderLowerLevel, setSliderLowerLevel] = React.useState(0);
  const [sliderUpperLevel, setSliderUpperLevel] = React.useState(255);
  const [selectColourMap, setSelectColourMap] = React.useState('');

  const handleEnabledChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    // disabling false colour
    if (!checked) {
      changeColourMap(undefined);
      changeLowerLevel(undefined);
      changeUpperLevel(undefined);
    } else {
      changeColourMap(selectColourMap !== '' ? selectColourMap : undefined);
      changeLowerLevel(sliderLowerLevel);
      changeUpperLevel(sliderUpperLevel);
    }
    setEnabled(checked);
  };

  return (
    <Paper>
      <Stack direction="column" sx={{ width: 300 }} spacing={1} padding={2}>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={handleEnabledChange} />}
          label="False Colour"
        />
        <FormControl disabled={!enabled}>
          <InputLabel id="colour-map-select-label">Colour Map</InputLabel>
          <Select
            labelId="colour-map-select-label"
            id="colour-map-select"
            value={selectColourMap}
            label="Colour Map"
            onChange={handleColourMapChange}
          >
            <MenuItem value="">
              <em>Default</em>
            </MenuItem>
            {colourMaps?.map((colourMap) => (
              <MenuItem key={colourMap} value={colourMap}>
                {colourMap}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* TODO: is it better UX for these to be separate sliders or one range slider? */}
        <FormControl disabled={!enabled}>
          <FormLabel id="lower-level-label" sx={{ margin: 'auto' }}>
            Lower Level (LL)
          </FormLabel>
          <Slider
            disabled={!enabled}
            aria-labelledby="lower-level-label"
            value={sliderLowerLevel}
            valueLabelDisplay="auto"
            marks={marks}
            onChange={(event, value) =>
              typeof value === 'number' && setSliderLowerLevel(value)
            }
            onChangeCommitted={(event, value) =>
              typeof value === 'number' && changeLowerLevel(value)
            }
            min={0}
            max={255}
          />
        </FormControl>
        <img src={colourBar} alt="Colour bar" />
        <FormControl disabled={!enabled}>
          <Slider
            disabled={!enabled}
            aria-labelledby="upper-level-label"
            value={sliderUpperLevel}
            valueLabelDisplay="auto"
            marks={marks}
            onChange={(event, value) =>
              typeof value === 'number' && setSliderUpperLevel(value)
            }
            onChangeCommitted={(event, value) =>
              typeof value === 'number' && changeUpperLevel(value)
            }
            min={0}
            max={255}
          />
          <FormLabel id="upper-level-label" sx={{ margin: 'auto' }}>
            Upper Level (UL)
          </FormLabel>
        </FormControl>
      </Stack>
    </Paper>
  );
};

export default FalseColourPanel;
