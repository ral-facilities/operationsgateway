import React from 'react';
import Box from '@mui/material/Box';
import { Button, Divider } from '@mui/material';
import ExportDialogue from './exportDialogue.component';

const ExportButton = () => {
  const [exportOpen, setExportOpen] = React.useState<boolean>(false);
  return (
    <Box
      sx={{
        paddingRight: '16px',
        paddingLeft: '8px',
        paddingTop: '8px',
        paddingbottom: '8px',
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Divider orientation="vertical" flexItem sx={{ marginRight: 1 }} />
        <Button
          sx={{ mx: '4px' }}
          onClick={() => setExportOpen(true)}
          variant="outlined"
        >
          Export
        </Button>
        <ExportDialogue
          open={exportOpen}
          onClose={() => setExportOpen(false)}
        />
      </Box>
    </Box>
  );
};

export default ExportButton;
