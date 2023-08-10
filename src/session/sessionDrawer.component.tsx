import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Theme,
  Typography,
  List,
  ListItem,
  IconButton,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Drawer from '@mui/material/Drawer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useSession } from '../api/sessions';
import { SessionListItem } from '../app.types';
import { importSession } from '../state/store';
import { useAppDispatch } from '../state/hooks';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  height: '100%',
}));

export interface SessionDrawerProps {
  openSessionSave: () => void;
  openSessionEdit: (sessionData: SessionListItem) => void;
  openSessionDelete: (sessionData: SessionListItem) => void;
  sessionsList: SessionListItem[] | undefined;
  loadedSessionId: string | undefined;
  onChangeLoadedSessionId: (loadedSessionId: string | undefined) => void;
}

interface SessionListElementProps extends SessionListItem {
  handleImport: (sessionId: string) => void;
  selected: boolean;
  openSessionEdit: (sessionData: SessionListItem) => void;
  openSessionDelete: (sessionData: SessionListItem) => void;
}

const SessionListElement = (
  props: SessionListElementProps
): React.ReactElement => {
  const {
    openSessionDelete,
    openSessionEdit,
    selected,
    handleImport,
    ...session
  } = props;

  return (
    <ListItemButton
      selected={selected}
      sx={{
        textDecoration: 'none',
        padding: 1,
      }}
      onClick={() => {
        handleImport(session._id);
      }}
    >
      <ListItemText
        primaryTypographyProps={{
          variant: 'button',
          sx: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            overflowWrap: 'break-word',
          },
        }}
      >
        {session.name}
      </ListItemText>
      <Box>
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            openSessionEdit(session);
          }}
          aria-label={`edit ${session.name} session`}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            openSessionDelete(session);
          }}
          aria-label={`delete ${session.name} session`}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </ListItemButton>
  );
};

const SessionsDrawer = (props: SessionDrawerProps): React.ReactElement => {
  const {
    openSessionSave,
    openSessionDelete,
    openSessionEdit,
    sessionsList,
    loadedSessionId,
    onChangeLoadedSessionId,
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
        <List disablePadding>
          {sessionsList &&
            sessionsList.map((item, index) => (
              <ListItem key={item._id} disablePadding>
                <SessionListElement
                  {...item}
                  handleImport={handleSessionClick}
                  selected={loadedSessionId === item._id}
                  openSessionDelete={openSessionDelete}
                  openSessionEdit={openSessionEdit}
                />
              </ListItem>
            ))}
        </List>
      </StyledDrawer>
    </div>
  );
};

export default SessionsDrawer;
