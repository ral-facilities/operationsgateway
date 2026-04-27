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
import { useAppSelector } from '../../state/hooks';
import { selectMaxShots } from '../../state/slices/configSlice';

export interface MaxShotsProps {
  maxShots: SearchParams['maxShots'];
  changeMaxShots: (maxShots: SearchParams['maxShots']) => void;
  searchParamsUpdated: () => void;
}

const MaxShots = (props: MaxShotsProps): React.ReactElement => {
  const { maxShots, changeMaxShots, searchParamsUpdated } = props;

  const maxShotsOptions = useAppSelector(selectMaxShots);

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
            {maxShotsOptions.map(({ value }, i) => (
              <FormControlLabel
                key={i}
                value={value === 'Unlimited' ? Infinity : value}
                control={<Radio aria-label={`Select ${value} max shots`} />}
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
