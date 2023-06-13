import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Button, Theme, Typography } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  height: '100%',
}));

interface SessionDrawerProps {
  openSessionSave: () => void;
}

const SessionsDrawer = (props: SessionDrawerProps): React.ReactElement => {
  const { openSessionSave } = props;
  const drawer = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        margin: '6px',
      }}
    >
      <Typography
        sx={(theme) => ({
          textTransform: 'none',
          fontWeight: theme.typography.fontWeightBold,
          fontSize: theme.typography.pxToRem(16),
        })}
      >
        Workspaces
      </Typography>
      <Box sx={{ marginLeft: 'auto' }}>
        <Button onClick={openSessionSave}>
          <AddCircleIcon />
        </Button>
      </Box>
    </Box>
  );
  return (
    <div>
      <StyledDrawer
        sx={{
          width: '200px',
          flexShrink: 0,
        }}
        PaperProps={{ sx: (theme: Theme) => ({ width: '200px' }) }}
        variant="permanent"
        anchor="left"
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {drawer}
        </Box>
        <Box></Box>
      </StyledDrawer>
    </div>
  );
};

export default SessionsDrawer;
