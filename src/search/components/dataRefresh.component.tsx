import React from 'react';
import { Box, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

export interface DataRefreshProps {
  refreshData: () => void;
}

const DataRefresh = (props: DataRefreshProps) => {
  const { refreshData } = props;

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
        <Button
          startIcon={<Refresh />}
          onClick={refreshData}
          size="small"
          aria-label="Refresh data"
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

DataRefresh.displayName = 'DataRefresh';

export default DataRefresh;
