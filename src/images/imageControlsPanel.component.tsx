import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  SelectProps,
  Slider,
  Stack,
  Switch,
} from '@mui/material';
import React from 'react';
import {
  ColourMapsParams,
  FalseColourParams,
  useColourBar,
  useColourMaps,
} from '../api/images';

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

interface ImageControlsPanelProps extends FalseColourParams {
  crosshairsMode: boolean;
  changeCrosshairsMode: (value: boolean) => void;
  changeColourMap: (colourMap: string | undefined) => void;
  changeLowerLevel: (value: number | undefined) => void;
  changeUpperLevel: (value: number | undefined) => void;
}

export function filterNamesWithSuffixR(
  colorMaps: ColourMapsParams | undefined
): ColourMapsParams {
  const filteredColorMaps: ColourMapsParams = {};

  for (const category in colorMaps) {
    const originalList = colorMaps[category];
    const filteredList = originalList?.filter(
      (colourmap) => !colourmap.endsWith('_r')
    );
    filteredColorMaps[category] = filteredList;
  }

  return filteredColorMaps;
}

export const ColourMapSelect = (
  props: {
    colourMap: string;
    handleColourMapChange: (event: SelectChangeEvent<unknown>) => void;
    colourMaps: ColourMapsParams;
  } & SelectProps
) => {
  const { colourMap, handleColourMapChange, colourMaps, ...selectProps } =
    props;
  const colourMapTypeNames = Object.keys(colourMaps);
  const colourMapNames = Object.values(colourMaps);

  return (
    <Select
      labelId={props.labelId}
      id="colour-map-select"
      label="Colour Map"
      {...selectProps}
      value={colourMap}
      onChange={handleColourMapChange}
    >
      <MenuItem value="">
        <em>Default</em>
      </MenuItem>

      {colourMapNames.map((mapNames, index) => {
        return [
          <ListSubheader key={colourMapTypeNames[index]}>
            {colourMapTypeNames[index]}
          </ListSubheader>,
          mapNames?.map((colourMap) => (
            <MenuItem key={colourMap} value={colourMap}>
              {colourMap}
            </MenuItem>
          )),
        ];
      })}
    </Select>
  );
};

const ImageControlsPanel = (props: ImageControlsPanelProps) => {
  const {
    colourMap,
    lowerLevel,
    upperLevel,
    crosshairsMode,
    changeColourMap,
    changeLowerLevel,
    changeUpperLevel,
    changeCrosshairsMode,
  } = props;

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
  const [reverseColour, setReverseColour] = React.useState(false);
  const [extendedColourMap, setExtendedColourMap] = React.useState(false);

  const handleEnabledChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
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
  const handleReverseColour = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (selectColourMap !== '') {
      if (!checked) {
        changeColourMap(selectColourMap);
      } else {
        changeColourMap(`${selectColourMap}_r`);
      }
    }
    setReverseColour(checked);
  };

  const filteredColourMaps = filterNamesWithSuffixR(colourMaps);
  const mainColourMap = 'Perceptually Uniform Sequential';
  const filteredColourMapsMain = {
    [mainColourMap]: filteredColourMaps[mainColourMap],
  };

  const colourMapsList = extendedColourMap
    ? Object.values(colourMaps ?? {}).flat()
    : colourMaps?.[mainColourMap];

  const handleExtendColourMaps = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setExtendedColourMap(checked);
  };

  const handleChangeCrosshairMode = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    changeCrosshairsMode(checked);
  };

  const handleColourMapChange = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as string;
    setSelectColourMap(newValue);
    changeColourMap(
      newValue !== ''
        ? !reverseColour
          ? newValue
          : colourMapsList?.includes(`${newValue}_r`)
            ? `${newValue}_r`
            : newValue
        : undefined
    );
  };

  const colourMapsNames = colourMapsList?.filter(
    (colourmap) => !colourmap?.endsWith('_r')
  );

  const colourMapsReverseNames = colourMapsList
    ?.filter((colourmap) => colourmap?.endsWith('_r'))
    .map((colourmap) => colourmap?.replace('_r', ''));

  const colourMapsWithReverse = colourMapsNames?.filter((value) =>
    colourMapsReverseNames?.includes(value)
  );

  return (
    <Paper>
      <Stack direction="column" sx={{ width: 300 }} spacing={1} padding={2}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch checked={enabled} onChange={handleEnabledChange} />
            }
            label="False Colour"
          />
          <FormControlLabel
            disabled={
              !colourMapsWithReverse?.includes(selectColourMap) || !enabled
            }
            control={
              <Switch checked={reverseColour} onChange={handleReverseColour} />
            }
            label="Reverse Colour"
          />
          <FormControlLabel
            disabled={!enabled}
            control={
              <Switch
                checked={extendedColourMap}
                onChange={handleExtendColourMaps}
              />
            }
            label="Show extended colourmap options"
          />
          <FormControlLabel
            control={
              <Switch
                checked={crosshairsMode}
                onChange={handleChangeCrosshairMode}
              />
            }
            label="Centroid / Cross Hairs"
          />
        </FormGroup>

        <FormControl disabled={!enabled}>
          <InputLabel id="colour-map-select-label">Colour Map</InputLabel>
          {colourMaps && (
            <ColourMapSelect
              colourMap={selectColourMap}
              handleColourMapChange={handleColourMapChange}
              colourMaps={
                extendedColourMap ? filteredColourMaps : filteredColourMapsMain
              }
              labelId="colour-map-select-label"
            />
          )}
        </FormControl>
        <FormControl disabled={!enabled}>
          <FormLabel id="range-slider-label" sx={{ margin: 'auto' }}>
            Level Range
          </FormLabel>
          <Slider
            disabled={!enabled}
            aria-labelledby="range-slider-label"
            value={[sliderLowerLevel, sliderUpperLevel]}
            valueLabelDisplay="auto"
            marks={marks}
            onChange={(_event, newValue) => {
              if (Array.isArray(newValue)) {
                const [lower, upper] = newValue;
                setSliderLowerLevel(lower);
                setSliderUpperLevel(upper);
              }
            }}
            onChangeCommitted={(_event, newValue) => {
              if (Array.isArray(newValue)) {
                const [lower, upper] = newValue;
                changeLowerLevel(lower);
                changeUpperLevel(upper);
              }
            }}
            min={0}
            max={255}
          />
        </FormControl>
        <img src={colourBar} alt="Colour bar" />
      </Stack>
    </Paper>
  );
};

export default ImageControlsPanel;
