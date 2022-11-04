import React from 'react';
import { Box, Typography, Divider, Grid, TextField } from '@mui/material';
import { Adjust } from '@mui/icons-material';
import { useClickOutside } from '../../hooks';

const ShotNumberPopup = (): React.ReactElement => {
  const [min, setMin] = React.useState<number>(0);
  const [max, setMax] = React.useState<number>(99999999);

  const invalidRange = min > max;

  return (
    <div style={{ paddingTop: 5, paddingLeft: 5 }}>
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
            name="shotnumber min"
            label="Min"
            value={min}
            type="number"
            size="small"
            inputProps={{ min: 0, max: 99999999 }}
            onChange={(event) => setMin(Number(event.target.value))}
            error={invalidRange}
            {...(invalidRange && { helperText: 'Invalid range' })}
          />
        </Grid>
        <Grid item xs={1}>
          <p>to</p>
        </Grid>
        <Grid item xs={5}>
          <TextField
            name="shotnumber max"
            label="Max"
            value={max}
            type="number"
            size="small"
            inputProps={{ min: 0, max: 99999999 }}
            onChange={(event) => setMax(Number(event.target.value))}
            error={invalidRange}
            {...(invalidRange && { helperText: 'Invalid range' })}
          />
        </Grid>
      </Grid>
    </div>
  );
};

const ShotNumber = (): React.ReactElement => {
  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Box
        sx={{
          border: '1.5px solid',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 5,
          cursor: 'pointer',
        }}
        onClick={() => toggle(!isOpen)}
      >
        <Adjust sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
        <div>
          <Typography>Shot Number</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Select
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
          <ShotNumberPopup />
        </Box>
      )}
    </Box>
  );
};

ShotNumber.displayName = 'ShotNumber';

export default ShotNumber;
