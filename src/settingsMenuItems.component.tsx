import {
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Switch,
} from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  ColourMapSelect,
  filterNamesWithSuffixR,
} from './images/falseColourPanel.component';
import { useColourMaps } from './api/images';
import {
  useUpdateUserPreference,
  useUserPreference,
} from './api/userPreferences';

export const DEFAULT_COLOUR_MAP_PREFERENCE_NAME = 'default_colour_map';

const SettingsMenuItems = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const [reverseColour, setReverseColour] = React.useState(false);
  const [extendedColourMap, setExtendedColourMap] = React.useState(false);

  const { data: colourMaps } = useColourMaps();

  const { data: preferredColourMap } = useUserPreference<string>(
    DEFAULT_COLOUR_MAP_PREFERENCE_NAME
  );

  const selectColourMap = preferredColourMap?.replace('_r', '') ?? '';

  const { mutateAsync: changePreferredColourMap } = useUpdateUserPreference<
    string | null
  >(DEFAULT_COLOUR_MAP_PREFERENCE_NAME);

  const filteredColourMaps = filterNamesWithSuffixR(colourMaps);
  const mainColourMap = 'Perceptually Uniform Sequential';
  // we want to allow the user to see their selected colour map even in the "main"
  // colourmap options if they've selected an extended colourmap
  const selectedColourMapCategory = Object.entries(filteredColourMaps)?.find(
    (colourMap) => colourMap?.[1]?.includes(selectColourMap)
  )?.[0];
  const filteredColourMapsMain = {
    [mainColourMap]: filteredColourMaps[mainColourMap],
    ...(selectedColourMapCategory &&
      selectedColourMapCategory !== mainColourMap && {
        [selectedColourMapCategory]: [selectColourMap],
      }),
  };

  const colourMapsList = extendedColourMap
    ? Object.values(colourMaps ?? {}).flat()
    : colourMaps?.[mainColourMap] ?? [];

  const colourMapsNames = colourMapsList?.filter(
    (colourmap) => !colourmap?.endsWith('_r')
  );

  const colourMapsReverseNames = colourMapsList
    ?.filter((colourmap) => colourmap?.endsWith('_r'))
    .map((colourmap) => colourmap?.replace('_r', ''));

  const colourMapsWithReverse = colourMapsNames?.filter((value) =>
    colourMapsReverseNames?.includes(value)
  );

  const handleColourMapChange = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as string;
    changePreferredColourMap({
      value:
        newValue !== ''
          ? !reverseColour
            ? newValue
            : colourMapsList?.includes(`${newValue}_r`)
            ? `${newValue}_r`
            : newValue
          : null,
    });
  };

  const handleExtendColourMaps = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setExtendedColourMap(checked);
  };

  const handleReverseColour = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (selectColourMap !== '') {
      if (!checked) {
        changePreferredColourMap({
          value: selectColourMap,
        });
      } else {
        changePreferredColourMap({
          value: `${selectColourMap}_r`,
        });
      }
    }
    setReverseColour(checked);
  };

  // observe body for new nodes (this is where #settings gets added)

  const observer = React.useMemo(
    () =>
      new MutationObserver((mutations) => {
        if (document.body.querySelector('#settings ul')) {
          setMenuOpen(true);
        } else {
          setMenuOpen(false);
        }
      }),
    []
  );

  React.useEffect(() => {
    if (!observer) return;
    observer.observe(document.body, {
      childList: true,
    });
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  if (!menuOpen) {
    return null;
  } else {
    return ReactDOM.createPortal(
      <>
        <Divider />
        <MenuItem
          sx={[
            { '&:hover': { backgroundColor: 'transparent' }, cursor: 'unset' },
          ]}
          disableRipple
        >
          <FormGroup>
            <FormControl>
              <InputLabel id="default-colour-map-select-label">
                Default Colour Map
              </InputLabel>
              <ColourMapSelect
                colourMap={selectColourMap}
                handleColourMapChange={handleColourMapChange}
                colourMaps={
                  extendedColourMap
                    ? filteredColourMaps
                    : filteredColourMapsMain
                }
                fullWidth
                label={'Default Colour Map'}
              />
            </FormControl>
            <FormControlLabel
              disabled={!colourMapsWithReverse?.includes(selectColourMap)}
              control={
                <Switch
                  checked={reverseColour}
                  onChange={handleReverseColour}
                />
              }
              label="Reverse Colour"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={extendedColourMap}
                  onChange={handleExtendColourMaps}
                />
              }
              componentsProps={{
                typography: {
                  sx: {
                    maxWidth: '200px',
                    whiteSpace: 'normal',
                  },
                },
              }}
              label="Show extended colourmap options"
            />
          </FormGroup>
        </MenuItem>
      </>,
      // we know this is not null from the mutation observer
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      document.querySelector('#settings ul')!
    );
  }
};

export default SettingsMenuItems;
