import React from 'react';
import { Box, Typography, Divider, Grid, TextField } from '@mui/material';
import { Adjust } from '@mui/icons-material';
import { useClickOutside } from '../../hooks';
import { FLASH_ANIMATION } from '../../animation';

export interface ShotNumberProps {
  searchParameterShotnumMin?: number;
  searchParameterShotnumMax?: number;
  changeSearchParameterShotnumMin: (min: number | undefined) => void;
  changeSearchParameterShotnumMax: (max: number | undefined) => void;
  resetDateRange: () => void;
  resetExperimentTimeframe: () => void;
  isDateToShotnum: boolean;
  invalidShotNumberRange: boolean;
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
  } = props;

  return (
    <Box
      sx={{
        paddingTop: '5px',
        paddingLeft: '5px',
        bgcolor: 'background.default',
      }}
    >
      <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
        Select your shot number
      </Typography>
      <Divider
        sx={{
          marginBottom: 2,
          borderBottomWidth: 2,
          backgroundColor: 'black',
          width: '90%',
        }}
      />
      <Grid container spacing={1}>
        <Grid item xs={5}>
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
              if (!event.target.value && !max) resetExperimentTimeframe();
            }}
            error={invalidShotNumberRange}
            {...(invalidShotNumberRange && { helperText: 'Invalid range' })}
          />
        </Grid>
        <Grid item xs={1}>
          <p>to</p>
        </Grid>
        <Grid item xs={5}>
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
          paddingRight: 5,
          paddingBottom: '4px',
          cursor: 'pointer',
          overflow: 'hidden',
          ...(flashAnimationPlaying && {
            animation: `${FLASH_ANIMATION.animation} ${FLASH_ANIMATION.length}ms`,
          }),
        }}
        onClick={() => toggle(!isOpen)}
      >
        <Adjust sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
        <div>
          <Typography noWrap>Shot Number</Typography>
          <Typography noWrap variant="subtitle1" sx={{ fontWeight: 'bold' }}>
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
            top: 55,
            zIndex: 2,
            backgroundColor: '#ffffff',
            width: 300,
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
