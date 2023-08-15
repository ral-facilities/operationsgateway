import React from 'react';
import { Box, Button, Typography, ListItem, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Drawer from '@mui/material/Drawer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useSession } from '../api/sessions';
import { SessionListItem } from '../app.types';
import { importSession } from '../state/store';
import { useAppDispatch } from '../state/hooks';

export interface SessionDrawerProps {
  openSessionSave: () => void;
  sessionsList: SessionListItem[] | undefined;
  loadedSessionId: string | undefined;
  onChangeLoadedSessionId: (selectedSessionId: string | undefined) => void;
}

interface SessionListElementProps extends SessionListItem {
  handleImport: (sessionId: string) => void;
  selected: boolean;
}

const SessionListElement = (
  props: SessionListElementProps
): React.ReactElement => {
  const { selected, handleImport, ...session } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        backgroundColor: selected ? 'primary.main' : 'background.paper',
        padding: 0,
      }}
    >
      <Button
        fullWidth
        sx={{
          display: 'flex',
          backgroundColor: selected ? 'primary.main' : 'background.paper',
          width: '100%',
          textDecoration: 'none',
          color: selected ? 'white' : 'inherit',
        }}
        onClick={() => {
          handleImport(session._id);
        }}
      >
        <Typography
          variant="button"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            overflowWrap: 'break-word',
          }}
        >
          {session.name}
        </Typography>
        <Box sx={{ display: 'flex', marginLeft: 'auto' }}>
          <IconButton size="small">
            <EditIcon />
          </IconButton>
          <IconButton size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Button>
    </Box>
  );
};

const SessionsDrawer = (props: SessionDrawerProps): React.ReactElement => {
  const {
    openSessionSave,
    loadedSessionId,
    onChangeLoadedSessionId,
    sessionsList,
  } = props;

  const { data: sessionData } = useSession(loadedSessionId);
  const dispatch = useAppDispatch();

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

  React.useEffect(() => {
    if (sessionData) {
      dispatch(importSession(sessionData.session));
    }
  }, [dispatch, sessionData]);

  const handleSessionClick = (sessionId: string) => {
    onChangeLoadedSessionId(undefined);
    onChangeLoadedSessionId(sessionId);
  };

  return (
    <Drawer
      sx={{
        width: '220px',
        position: 'relative',
      }}
      hideBackdrop
      PaperProps={{
        sx: {
          width: '220px',
          position: 'absolute',
        },
      }}
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
      <Box>
        {sessionsList &&
          sessionsList.map((item, index) => (
            <ListItem
              sx={{ padding: 0 }}
              key={item._id}
              alignItems="flex-start"
            >
              <SessionListElement
                {...item}
                handleImport={handleSessionClick}
                selected={loadedSessionId === item._id}
              />
            </ListItem>
          ))}
      </Box>
    </Drawer>
  );
};

export default SessionsDrawer;
