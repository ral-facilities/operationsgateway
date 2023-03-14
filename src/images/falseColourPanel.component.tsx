import React from 'react';
import {
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { FalseColourParams, useColourBar, useColourMaps } from '../api/images';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FalseColourPanelProps extends FalseColourParams {
  changeColourMap: (colourMap: string) => void;
  changeLowerLevel: (value: number) => void;
  changeUpperLevel: (value: number) => void;
}

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

const FalseColourPanel = (props: FalseColourPanelProps) => {
  const {
    colourMap,
    lowerLevel,
    upperLevel,
    changeColourMap,
    changeLowerLevel,
    changeUpperLevel,
  } = props;

  const handleChange = (event: SelectChangeEvent) => {
    changeColourMap(event.target.value as string);
  };

  const { data: colourMaps } = useColourMaps();
  const { data: colourBar } = useColourBar({
    colourMap: colourMap !== '' ? colourMap : undefined,
    lowerLevel: lowerLevel,
    upperLevel: upperLevel,
  });

  return (
    <Paper>
      <Stack direction="column" sx={{ width: 300 }} spacing={1} padding={2}>
        <Typography>False Colour</Typography>
        <FormControl>
          <InputLabel id="colour-map-select-label">Colour Map</InputLabel>
          <Select
            labelId="colour-map-select-label"
            id="colour-map-select"
            value={colourMap}
            label="Colour Map"
            onChange={handleChange}
          >
            {colourMaps?.map((colourMap) => (
              <MenuItem key={colourMap} value={colourMap}>
                {colourMap}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* TODO: is it better UX for these to be separate sliders or one range slider? */}
        <FormControl>
          <FormLabel id="lower-level-label" sx={{ margin: 'auto' }}>
            Lower Level (LL)
          </FormLabel>
          <Slider
            aria-labelledby="lower-level-label"
            defaultValue={0}
            valueLabelDisplay="auto"
            marks={marks}
            onChangeCommitted={(event, value) =>
              typeof value === 'number' && changeLowerLevel(value)
            }
            min={0}
            max={255}
          />
        </FormControl>
        <img src={colourBar} alt="Colour bar" />
        <FormControl>
          <Slider
            aria-labelledby="upper-level-label"
            defaultValue={255}
            valueLabelDisplay="auto"
            marks={marks}
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
