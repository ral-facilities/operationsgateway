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
  Typography,
} from '@mui/material';
import React from 'react';
import {
  ColourMapsParams,
  FalseColourParams,
  useColourBar,
  useColourMaps,
  useImageCrosshair,
} from '../api/images';

export const calculateUpperRangeFromBitDepth = (
  bitDepth: number = 8
): number => {
  return 2 ** bitDepth - 1;
};

const generateSliderMarks = (bitDepth: number = 8) => {
  const upperRange = calculateUpperRangeFromBitDepth(bitDepth);
  const step = Math.round(upperRange / 8); // Divide range into 8 segments

  return Array.from({ length: 9 }, (_, i) => ({
    value: i === 8 ? upperRange : i * step, // Ensure last value is upperRange
    label: i === 8 ? upperRange : i % 2 === 0 ? `${i * step}` : undefined, // Label every other mark
  }));
};

interface ImageControlsPanelProps extends FalseColourParams {
  crosshairsMode: boolean;
  changeCrosshairsMode: (value: boolean) => void;
  changeColourMap: (colourMap: string | undefined) => void;
  changeLowerLevel: (value: number | undefined) => void;
  changeUpperLevel: (value: number | undefined) => void;
  crosshairData: ReturnType<typeof useImageCrosshair>['data'];
  bitDepth?: number;
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
    crosshairData,
    bitDepth,
  } = props;

  const { data: colourMaps } = useColourMaps();
  const { data: colourBar } = useColourBar(
    {
      colourMap: colourMap,
      lowerLevel: lowerLevel,
      upperLevel: upperLevel,
    },
    bitDepth
  );

  const [enabled, setEnabled] = React.useState(true);
  const [sliderLowerLevel, setSliderLowerLevel] = React.useState(0);
  const [sliderUpperLevel, setSliderUpperLevel] = React.useState(
    calculateUpperRangeFromBitDepth(bitDepth)
  );
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
    <Paper data-testid="image-controls-panel">
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

          {crosshairsMode && crosshairData && (
            <>
              <Typography>
                Position: ({crosshairData.column.position},{' '}
                {crosshairData.row.position})
              </Typography>
              <Typography>X FWHM: {crosshairData.column.fwhm}</Typography>
              <Typography>Y FWHM: {crosshairData.row.fwhm}</Typography>
            </>
          )}
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
            marks={generateSliderMarks(bitDepth)}
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
            max={calculateUpperRangeFromBitDepth(bitDepth)}
          />
        </FormControl>
        <img src={colourBar} alt="Colour bar" />
      </Stack>
    </Paper>
  );
};

export default ImageControlsPanel;
