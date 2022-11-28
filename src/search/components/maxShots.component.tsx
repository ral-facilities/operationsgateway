import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Numbers } from '@mui/icons-material';
import { useClickOutside } from '../../hooks';

export interface MaxShotsProps {
  maxNumber?: number;
  changeMaxNumber: (max: number) => void;
}

const MaxShotsPopup = (props: MaxShotsProps): React.ReactElement => {
  return (
    <div style={{ paddingTop: 5, paddingLeft: 5 }}>
      <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
        Select your maximum number of shots
      </Typography>
      <Divider
        sx={{
          marginBottom: 2,
          borderBottomWidth: 2,
          backgroundColor: 'black',
          width: '90%',
        }}
      />
      {/* <Grid container spacing={1}>
        <Grid item xs={5}>
          <TextField
            name="shot number min"
            label="Min"
            value={receivedMin}
            type="number"
            size="small"
            inputProps={{ min: 0 }}
            onChange={(event) =>
              changeMin(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            error={invalidRange}
            {...(invalidRange && { helperText: 'Invalid range' })}
          />
        </Grid>
        <Grid item xs={1}>
          <p>to</p>
        </Grid>
        <Grid item xs={5}>
          <TextField
            name="shot number max"
            label="Max"
            value={receivedMax}
            type="number"
            size="small"
            inputProps={{ min: 0 }}
            onChange={(event) =>
              changeMax(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            error={invalidRange}
            {...(invalidRange && { helperText: 'Invalid range' })}
          />
        </Grid>
      </Grid> */}
    </div>
  );
};

const MaxShots = (props: MaxShotsProps): React.ReactElement => {
  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Box
        aria-label={`${isOpen ? 'close' : 'open'} max shots search box`}
        sx={{
          border: '1.5px solid',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 5,
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onClick={() => toggle(!isOpen)}
      >
        <Numbers sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
        <div>
          <Typography noWrap>Max shots</Typography>
          <Typography noWrap variant="subtitle1" sx={{ fontWeight: 'bold' }}>
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
          <MaxShotsPopup {...props} />
        </Box>
      )}
    </Box>
  );
};

MaxShots.displayName = 'MaxShots';

export default MaxShots;
