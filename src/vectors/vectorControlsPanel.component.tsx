import { Paper, Slider, Stack, Typography } from '@mui/material';
import type React from 'react';
import type { Vector } from '../app.types';

interface VectorControlPanelProps {
  vector?: Vector;
  range: { skip: number; limit: number };
  onChangeRange: (range: { skip: number; limit: number }) => void;
}

const VectorControlPanel = (props: VectorControlPanelProps) => {
  const { vector, range, onChangeRange } = props;

  const handleRangeChange = (
    _: Event | React.SyntheticEvent,
    newValue: number | number[]
  ) => {
    if (!Array.isArray(newValue)) return;
    onChangeRange({ skip: newValue[0], limit: newValue[1] });
  };

  const min = 0;
  const max = vector?.data.length || 0;

  // Marks for Slider
  const marks = [
    {
      value: min,
      label: `${min}`,
    },
    {
      value: max,
      label: `${max}`,
    },
  ];

  return (
    <Paper
      data-testid="vector-control-panel"
      sx={{ padding: 2, width: 300, margin: 1 }}
    >
      <Stack spacing={2} mb={2}>
        <Typography variant="subtitle1">Select Vector Range</Typography>
        <Slider
          value={[range.skip, range.limit]}
          onChange={handleRangeChange}
          onChangeCommitted={handleRangeChange}
          min={min}
          max={max}
          step={1}
          valueLabelDisplay="auto"
          marks={marks}
        />
      </Stack>
    </Paper>
  );
};

export default VectorControlPanel;
