import { Refresh } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

export interface DataRefreshProps {
  timeframeSet: boolean;
  refreshData: () => void;
}

const DataRefresh = (props: DataRefreshProps) => {
  const { timeframeSet, refreshData } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        marginTop: '6px',
        overflow: 'hidden',
      }}
    >
      <Button
        disabled={!timeframeSet}
        startIcon={<Refresh />}
        onClick={refreshData}
        size="small"
        aria-label="Refresh data"
      >
        Refresh
      </Button>
    </Box>
  );
};

DataRefresh.displayName = 'DataRefresh';

export default DataRefresh;
