import Adjust from '@mui/icons-material/Adjust';
import {
  Box,
  Divider,
  Grid2 as Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { FLASH_ANIMATION } from '../../animation';
import { ShotNumType } from '../../app.types';
import { useClickOutside } from '../../hooks';

export interface ShotNumberProps {
  searchParameterShotnumMin?: ShotNumType;
  searchParameterShotnumMax?: ShotNumType;
  changeSearchParameterShotnumMin: (min: ShotNumType | undefined) => void;
  changeSearchParameterShotnumMax: (max: ShotNumType | undefined) => void;
  resetDateRange: () => void;
  resetExperimentTimeframe: () => void;
  isDateToShotnum: boolean;
  invalidShotNumberRange: boolean;
  searchParamsUpdated: () => void;
  noSingleDataTypeSelected?: boolean;
  shotNumType: 'number' | 'string';
}

const ShotNumberPopup = (props: ShotNumberProps): React.ReactElement => {
  const {
    searchParameterShotnumMin: min,
    searchParameterShotnumMax: max,
    changeSearchParameterShotnumMin: changeMin,
    changeSearchParameterShotnumMax: changeMax,
    invalidShotNumberRange,
    resetDateRange,
    resetExperimentTimeframe,
    searchParamsUpdated,
    shotNumType,
  } = props;

  return (
    <Box
      sx={{
        padding: 0.5,
        paddingBottom: 1,
        bgcolor: 'background.default',
      }}
    >
      <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
        Select your shot number
      </Typography>
      <Divider
        sx={{
          marginBottom: 1,
          borderBottomWidth: 2,
          backgroundColor: 'black',
        }}
      />
      <Grid container spacing={1} alignItems="center">
        <Grid size="grow">
          <TextField
            name="shot number min"
            label="Min"
            value={min ?? ''}
            type={shotNumType === 'number' ? 'number' : 'text'}
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            onChange={(event) => {
              changeMin(
                event.target.value
                  ? shotNumType === 'number'
                    ? Number(event.target.value)
                    : event.target.value
                  : undefined
              );
              resetDateRange();
              searchParamsUpdated();
              if (!event.target.value && !max) resetExperimentTimeframe();
            }}
            error={invalidShotNumberRange}
            {...(invalidShotNumberRange && { helperText: 'Invalid range' })}
          />
        </Grid>
        <Grid size="auto">
          <Typography noWrap>to</Typography>
        </Grid>
        <Grid size="grow">
          <TextField
            name="shot number max"
            label="Max"
            value={max ?? ''}
            type={shotNumType === 'number' ? 'number' : 'text'}
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            onChange={(event) => {
              changeMax(
                event.target.value
                  ? shotNumType === 'number'
                    ? Number(event.target.value)
                    : event.target.value
                  : undefined
              );
              resetDateRange();
              searchParamsUpdated();
              if (!event.target.value && !min) resetExperimentTimeframe();
            }}
            error={invalidShotNumberRange}
            {...(invalidShotNumberRange && { helperText: 'Invalid range' })}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const ShotNumber = (props: ShotNumberProps): React.ReactElement => {
  const {
    searchParameterShotnumMin: min,
    searchParameterShotnumMax: max,
    isDateToShotnum,
    invalidShotNumberRange,
    noSingleDataTypeSelected,
  } = props;

  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  const [flashAnimationPlaying, setFlashAnimationPlaying] =
    React.useState<boolean>(false);

  // Stop the flash animation from playing after 1500ms
  React.useEffect(() => {
    if (
      (typeof props.searchParameterShotnumMax === 'undefined' &&
        typeof props.searchParameterShotnumMin === 'undefined') ||
      isDateToShotnum
    ) {
      setFlashAnimationPlaying(true);
      setTimeout(() => {
        setFlashAnimationPlaying(false);
      }, FLASH_ANIMATION.length);
    }
  }, [
    isDateToShotnum,
    props.searchParameterShotnumMax,
    props.searchParameterShotnumMin,
  ]);

  // Prevent the flash animation playing on mount
  React.useEffect(() => {
    setFlashAnimationPlaying(false);
  }, []);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Tooltip
        title={
          noSingleDataTypeSelected
            ? 'Please ensure a single data type is selected to enable searching by shot number'
            : null
        }
      >
        <Box
          aria-label={`${isOpen ? 'close' : 'open'} shot number search box`}
          sx={{
            border: '1.5px solid',
            borderColor: invalidShotNumberRange
              ? 'error.main'
              : noSingleDataTypeSelected
                ? 'action.disabled'
                : undefined,
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'row',
            paddingRight: 2,
            paddingBottom: '4px',
            cursor: !noSingleDataTypeSelected ? 'pointer' : 'default',
            overflow: 'hidden',
            ...(flashAnimationPlaying && {
              animation: `${FLASH_ANIMATION.animation} ${FLASH_ANIMATION.length}ms`,
            }),
          }}
          onClick={() => {
            if (!noSingleDataTypeSelected) toggle(!isOpen);
          }}
        >
          <Adjust
            sx={{
              fontSize: 32,
              margin: '0px 2px',
              alignSelf: 'center',
              color: noSingleDataTypeSelected ? 'action.disabled' : undefined,
            }}
          />
          <Box
            sx={{
              color: noSingleDataTypeSelected ? 'action.disabled' : undefined,
            }}
          >
            <Typography noWrap sx={{ fontWeight: 'bold' }}>
              Shot Number
            </Typography>
            <Typography variant="subtitle1">
              {min !== undefined && max === undefined
                ? `Minimum: ${min}`
                : min === undefined && max !== undefined
                  ? `Maximum: ${max}`
                  : min !== undefined && max !== undefined
                    ? `${min} to ${max}`
                    : 'Select'}
            </Typography>
          </Box>
        </Box>
      </Tooltip>
      {isOpen && (
        <Box
          role="dialog"
          sx={{
            border: '1px solid',
            position: 'absolute',
            right: 0,
            top: 55,
            zIndex: 1500,
            backgroundColor: '#ffffff',
            width: 360,
          }}
          ref={popover}
        >
          <ShotNumberPopup {...props} />
        </Box>
      )}
    </Box>
  );
};

ShotNumber.displayName = 'ShotNumber';

export default ShotNumber;
