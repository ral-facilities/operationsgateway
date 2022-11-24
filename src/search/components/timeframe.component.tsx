import React from 'react';
import {
  Box,
  Divider,
  Grid,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { useClickOutside } from '../../hooks';

export type TimeframeRange = {
  value: number;
  timescale: 'minutes' | 'hours' | 'days';
};

export interface TimeframeProps {
  timeframe: TimeframeRange | null;
  changeTimeframe: (value: TimeframeRange) => void;
}

const TimeframePopup = (props: TimeframeProps): React.ReactElement => {
  const { changeTimeframe } = props;

  const [workingTimeframe, setWorkingTimeframe] = React.useState<number>(0);

  return (
    <div style={{ padding: 5 }}>
      <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
        Select your timeframe
      </Typography>
      <Divider
        sx={{
          marginBottom: 2,
          borderBottomWidth: 2,
          backgroundColor: 'black',
          width: '90%',
        }}
      />
      <Grid container spacing={1} sx={{ paddingBottom: '15px' }}>
        <Grid item xs={4}>
          <Button
            variant="outlined"
            sx={{ height: '100%' }}
            onClick={() => changeTimeframe({ value: 10, timescale: 'minutes' })}
          >
            Last 10 mins
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="outlined"
            sx={{ height: '100%' }}
            onClick={() => changeTimeframe({ value: 24, timescale: 'hours' })}
          >
            Last 24 hours
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="outlined"
            sx={{ height: '100%' }}
            onClick={() => changeTimeframe({ value: 7, timescale: 'days' })}
          >
            Last 7 days
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <TextField
            name="timeframe"
            label="Timeframe"
            value={workingTimeframe}
            type="number"
            size="small"
            inputProps={{ min: 0 }}
            onChange={(event) =>
              setWorkingTimeframe(Number(event.target.value))
            }
          />
        </Grid>
        <Grid container spacing={1} item xs={8}>
          <Grid item xs={4}>
            <Button
              size="small"
              variant="outlined"
              sx={{ height: '100%' }}
              onClick={() => {
                if (workingTimeframe > 0)
                  changeTimeframe({
                    value: workingTimeframe,
                    timescale: 'minutes',
                  });
              }}
            >
              Mins
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              size="small"
              variant="outlined"
              sx={{ height: '100%' }}
              onClick={() => {
                if (workingTimeframe > 0)
                  changeTimeframe({
                    value: workingTimeframe,
                    timescale: 'hours',
                  });
              }}
            >
              Hours
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              size="small"
              variant="outlined"
              sx={{ height: '100%' }}
              onClick={() => {
                if (workingTimeframe > 0)
                  changeTimeframe({
                    value: workingTimeframe,
                    timescale: 'days',
                  });
              }}
            >
              Days
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const Timeframe = (props: TimeframeProps): React.ReactElement => {
  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Box
        aria-label={`${isOpen ? 'close' : 'open'} timeframe search box`}
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
        <Schedule sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
        <div>
          <Typography noWrap>Timeframe</Typography>
          <Typography noWrap variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {props.timeframe
              ? `${props.timeframe.value} ${props.timeframe.timescale}`
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
            width: 330,
          }}
          ref={popover}
        >
          <TimeframePopup {...props} />
        </Box>
      )}
    </Box>
  );
};

Timeframe.displayName = 'Timeframe';

export default Timeframe;
