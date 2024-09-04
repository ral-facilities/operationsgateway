import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';
import { SearchParams } from '../../app.types';

export const MAX_SHOTS_VALUES = [50, 1000, Infinity];

export interface MaxShotsProps {
  maxShots: SearchParams['maxShots'];
  changeMaxShots: (maxShots: SearchParams['maxShots']) => void;
  searchParamsUpdated: () => void;
}

const MaxShots = (props: MaxShotsProps): React.ReactElement => {
  const { maxShots, changeMaxShots, searchParamsUpdated } = props;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        aria-label="select max shots to display"
        sx={{
          display: 'flex',
          flexDirection: 'row',
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
            onChange={(_, value) => {
              searchParamsUpdated();
              changeMaxShots(Number(value));
            }}
          >
            {MAX_SHOTS_VALUES.map((value, i) => (
              <FormControlLabel
                key={i}
                value={value}
                control={
                  <Radio
                    aria-label={`Select ${
                      value === Infinity ? 'unlimited' : value
                    } max shots`}
                  />
                }
                label={value === Infinity ? 'Unlimited' : value}
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
