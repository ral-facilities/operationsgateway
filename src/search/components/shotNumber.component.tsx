import { Adjust } from '@mui/icons-material';
import { Box, Divider, Grid, TextField, Typography } from '@mui/material';
import React from 'react';
import { FLASH_ANIMATION } from '../../animation';
import { useClickOutside } from '../../hooks';

export interface ShotNumberProps {
  searchParameterShotnumMin?: number;
  searchParameterShotnumMax?: number;
  changeSearchParameterShotnumMin: (min: number | undefined) => void;
  changeSearchParameterShotnumMax: (max: number | undefined) => void;
  resetDateRange: () => void;
  resetExperimentTimeframe: () => void;
  isDateToShotnum: boolean;
  invalidShotNumberRange: boolean;
  searchParamsUpdated: () => void;
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
        <Grid item xs>
          <TextField
            name="shot number min"
            label="Min"
            value={min ?? ''}
            type="number"
            size="small"
            inputProps={{ min: 0 }}
            onChange={(event) => {
              changeMin(
                event.target.value ? Number(event.target.value) : undefined
              );
              resetDateRange();
              searchParamsUpdated();
              if (!event.target.value && !max) resetExperimentTimeframe();
            }}
            error={invalidShotNumberRange}
            {...(invalidShotNumberRange && { helperText: 'Invalid range' })}
          />
        </Grid>
        <Grid item xs="auto">
          <Typography noWrap>to</Typography>
        </Grid>
        <Grid item xs>
          <TextField
            name="shot number max"
            label="Max"
            value={max ?? ''}
            type="number"
            size="small"
            inputProps={{ min: 0 }}
            onChange={(event) => {
              changeMax(
                event.target.value ? Number(event.target.value) : undefined
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
      <Box
        aria-label={`${isOpen ? 'close' : 'open'} shot number search box`}
        sx={{
          border: '1.5px solid',
          borderColor: invalidShotNumberRange ? 'rgb(214, 65, 65)' : undefined,
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 2,
          paddingBottom: '4px',
          cursor: 'pointer',
          overflow: 'hidden',
          ...(flashAnimationPlaying && {
            animation: `${FLASH_ANIMATION.animation} ${FLASH_ANIMATION.length}ms`,
          }),
        }}
        onClick={() => toggle(!isOpen)}
      >
        <Adjust sx={{ fontSize: 32, margin: '0px 2px', alignSelf: 'center' }} />
        <div>
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
        </div>
      </Box>
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
