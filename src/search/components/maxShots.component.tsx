import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { SearchParams } from '../../app.types';

export const MAX_SHOTS_VALUES = [50, 1000, 'Unlimited'];

export interface MaxShotsProps {
  maxShots: SearchParams['maxShots'];
  changeMaxShots: (maxShots: SearchParams['maxShots']) => void;
}

const MaxShots = (props: MaxShotsProps): React.ReactElement => {
  const { maxShots, changeMaxShots } = props;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        aria-label="select max shots to display"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 5,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'left',
            marginRight: '10px',
          }}
        >
          <FormLabel>Max shots</FormLabel>
        </div>
        <FormControl>
          <RadioGroup
            row
            name="max shots group"
            aria-label="select max shots"
            value={maxShots}
            onChange={(_, value) =>
              Number.isNaN(Number.parseInt(value))
                ? changeMaxShots('Unlimited')
                : changeMaxShots(Number(value))
            }
          >
            {MAX_SHOTS_VALUES.map((value, i) => (
              <FormControlLabel
                key={i}
                value={value}
                control={<Radio />}
                label={value}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );
};

MaxShots.displayName = 'MaxShots';

export default MaxShots;
