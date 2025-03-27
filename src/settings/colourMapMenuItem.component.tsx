import {
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Switch,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import React from 'react';
import { FalseColourParams, useColourMaps } from '../api/images';
import {
  useUpdateUserPreference,
  useUserPreference,
} from '../api/userPreferences';
import { PREFERRED_COLOUR_MAP_PREFERENCE_NAME } from '../app.types';
import handleOG_APIError from '../handleOG_APIError';
import {
  ColourMapSelect,
  filterNamesWithSuffixR,
} from '../images/imageControlsPanel.component';

const ColourMapMenuItem = () => {
  const [reverseColour, setReverseColour] = React.useState(false);
  const [extendedColourMap, setExtendedColourMap] = React.useState(false);

  const { data: colourMaps } = useColourMaps();

  const { data: preferredColourMap } = useUserPreference<string>(
    PREFERRED_COLOUR_MAP_PREFERENCE_NAME
  );

  const selectColourMap = preferredColourMap?.replace('_r', '') ?? '';

  const { mutateAsync: mutatePreferredColourMap } = useUpdateUserPreference<
    string | null
  >(PREFERRED_COLOUR_MAP_PREFERENCE_NAME);

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
    : (colourMaps?.[mainColourMap] ?? []);

  const colourMapsNames = colourMapsList?.filter(
    (colourmap) => !colourmap?.endsWith('_r')
  );

  const colourMapsReverseNames = colourMapsList
    ?.filter((colourmap) => colourmap?.endsWith('_r'))
    .map((colourmap) => colourmap?.replace('_r', ''));

  const colourMapsWithReverse = colourMapsNames?.filter((value) =>
    colourMapsReverseNames?.includes(value)
  );

  const queryClient = useQueryClient();

  const changePreferredColourMap = (
    ...params: Parameters<typeof mutatePreferredColourMap>
  ): Promise<void> => {
    return mutatePreferredColourMap(...params)
      .then(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            return (
              // technically, we only need to invalidate records queries where there is an image channel in the projection
              // but I think passing that info into the query is more effort than just invalidating everything
              (query.queryKey[0] === 'records' &&
                // need to check for page to only invalidate table queries and not plot queries
                'page' in (query.queryKey[1] as object)) ||
              query.queryKey[0] === 'thumbnails' ||
              query.queryKey[0] === 'channelSummary' ||
              // we only need to invalidate the following queries if they didn't
              // manually select a colour map
              (query.queryKey[0] === 'images' &&
                (typeof query.queryKey[3] === 'undefined' ||
                  typeof (query.queryKey[3] as FalseColourParams).colourMap ===
                    'undefined')) ||
              (query.queryKey[0] === 'colourbar' &&
                (typeof query.queryKey[1] === 'undefined' ||
                  typeof (query.queryKey[1] as FalseColourParams).colourMap ===
                    'undefined'))
            );
          },
        });
      })
      .catch((error: AxiosError) => {
        handleOG_APIError(error);
      });
  };

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
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setExtendedColourMap(checked);
  };

  const handleReverseColour = (
    _event: React.ChangeEvent<HTMLInputElement>,
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

  return (
    <MenuItem
      sx={[{ '&:hover': { backgroundColor: 'transparent' }, cursor: 'unset' }]}
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
              extendedColourMap ? filteredColourMaps : filteredColourMapsMain
            }
            fullWidth
            label={'Default Colour Map'}
            labelId="default-colour-map-select-label"
          />
        </FormControl>
        <FormControlLabel
          disabled={!colourMapsWithReverse?.includes(selectColourMap)}
          control={
            <Switch checked={reverseColour} onChange={handleReverseColour} />
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
  );
};

export default ColourMapMenuItem;
