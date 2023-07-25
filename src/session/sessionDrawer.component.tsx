import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, IconButton, Theme, Typography } from '@mui/material';
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
        margin: '3.75px',
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
        <IconButton onClick={openSessionSave}>
          <AddCircleIcon />
        </IconButton>
      </Box>
    </Box>
  );
  return (
    <div>
      <StyledDrawer
        sx={{
          width: '220px',
          flexShrink: 0,
        }}
        PaperProps={{ sx: (theme: Theme) => ({ width: '220px' }) }}
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
