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
import { FLASH_ANIMATION } from '../../animation';

export type TimeframeRange = {
  value: number;
  timescale: 'minutes' | 'hours' | 'days';
};

export interface TimeframeProps {
  timeframe: TimeframeRange | null;
  changeTimeframe: (value: TimeframeRange) => void;
  resetExperimentTimeframe: () => void;
  resetShotnumber: () => void;
  searchParamsUpdated: () => void;
}

const TimeframePopup = (props: TimeframeProps): React.ReactElement => {
  const {
    changeTimeframe,
    resetExperimentTimeframe,
    resetShotnumber,
    searchParamsUpdated,
  } = props;

  const [workingTimeframe, setWorkingTimeframe] = React.useState<number>(0);

  return (
    <Box sx={{ padding: '5px', bgcolor: 'background.default' }}>
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
            size="small"
            variant="outlined"
            sx={{ height: '100%' }}
            onClick={() => {
              resetExperimentTimeframe();
              resetShotnumber();
              searchParamsUpdated();
              changeTimeframe({ value: 10, timescale: 'minutes' });
            }}
          >
            Last 10 mins
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            size="small"
            variant="outlined"
            sx={{ height: '100%' }}
            onClick={() => {
              resetExperimentTimeframe();
              resetShotnumber();
              searchParamsUpdated();
              changeTimeframe({ value: 24, timescale: 'hours' });
            }}
          >
            Last 24 hours
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            size="small"
            variant="outlined"
            sx={{ height: '100%' }}
            onClick={() => {
              resetExperimentTimeframe();
              resetShotnumber();
              searchParamsUpdated();
              changeTimeframe({ value: 7, timescale: 'days' });
            }}
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
            onChange={(event) => {
              setWorkingTimeframe(Number(event.target.value));
              searchParamsUpdated();
            }}
          />
        </Grid>
        <Grid container spacing={1} item xs={8}>
          <Grid item xs={4}>
            <Button
              size="small"
              variant="outlined"
              sx={{ height: '100%' }}
              onClick={() => {
                if (workingTimeframe > 0) {
                  resetExperimentTimeframe();
                  resetShotnumber();
                  searchParamsUpdated();
                  changeTimeframe({
                    value: workingTimeframe,
                    timescale: 'minutes',
                  });
                }
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
                if (workingTimeframe > 0) {
                  resetExperimentTimeframe();
                  resetShotnumber();
                  searchParamsUpdated();
                  changeTimeframe({
                    value: workingTimeframe,
                    timescale: 'hours',
                  });
                }
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
                if (workingTimeframe > 0) {
                  resetExperimentTimeframe();
                  resetShotnumber();
                  searchParamsUpdated();
                  changeTimeframe({
                    value: workingTimeframe,
                    timescale: 'days',
                  });
                }
              }}
            >
              Days
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

const Timeframe = (props: TimeframeProps): React.ReactElement => {
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
    if (props.timeframe === null) {
      setFlashAnimationPlaying(true);
      setTimeout(() => {
        setFlashAnimationPlaying(false);
      }, FLASH_ANIMATION.length);
    }
  }, [props.timeframe]);

  // Prevent the flash animation playing on mount
  React.useEffect(() => {
    setFlashAnimationPlaying(false);
  }, []);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Box
        aria-label={`${isOpen ? 'close' : 'open'} timeframe search box`}
        sx={{
          border: '1.5px solid',
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
        <Schedule
          sx={{ fontSize: 32, margin: '0px 2px', alignSelf: 'center' }}
        />
        <div>
          <Typography noWrap sx={{ fontWeight: 'bold' }}>
            Timeframe
          </Typography>
          <Typography noWrap variant="subtitle1">
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
            zIndex: 1500,
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
