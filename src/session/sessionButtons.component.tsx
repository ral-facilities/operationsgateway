import React from 'react';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';

const SessionsButtons = () => {
  return (
    <Box
      sx={{
        paddingRight: '16px',
        paddingLeft: '8px',
        paddingTop: '8px',
        paddingbottom: '8px',
      }}
    >
      <Button variant="outlined">Save</Button>
      <Button variant="outlined">Save as</Button>
    </Box>
  );
};

export default SessionsButtons;
