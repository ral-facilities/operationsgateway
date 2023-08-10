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

type SettingsMenuItemsProps = {
  lol?: string;
};

const SettingsMenuItems = (props: SettingsMenuItemsProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const [selectColourMap, setSelectColourMap] = React.useState('');
  const [reverseColour, setReverseColour] = React.useState(false);
  const [extendedColourMap, setExtendedColourMap] = React.useState(false);

  const { data: colourMaps } = useColourMaps();

  const filteredColourMaps = filterNamesWithSuffixR(colourMaps);
  const mainColourMap = 'Perceptually Uniform Sequential';
  const filteredColourMapsMain = {
    [mainColourMap]: filteredColourMaps[mainColourMap],
  };

  const colourMapsList = extendedColourMap
    ? Object.values(colourMaps ?? {}).flat()
    : colourMaps?.[mainColourMap];

  const colourMapsNames = colourMapsList?.filter(
    (colourmap) => !colourmap.endsWith('_r')
  );

  const colourMapsReverseNames = colourMapsList
    ?.filter((colourmap) => colourmap.endsWith('_r'))
    .map((colourmap) => colourmap.replace('_r', ''));

  const colourMapsWithReverse = colourMapsNames?.filter((value) =>
    colourMapsReverseNames?.includes(value)
  );

  const handleColourMapChange = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as string;
    setSelectColourMap(newValue);
    // TODO: request to set default colourmap
    // changeColourMap(
    //   newValue !== ''
    //     ? !reverseColour
    //       ? newValue
    //       : colourMapsList?.includes(`${newValue}_r`)
    //       ? `${newValue}_r`
    //       : newValue
    //     : undefined
    // );
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
        // changeColourMap(selectColourMap);
      } else {
        // changeColourMap(`${selectColourMap}_r`);
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
              <InputLabel id="colour-map-select-label">
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
