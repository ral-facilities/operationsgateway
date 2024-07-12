import React from 'react';
import {
  Box,
  Typography,
  ListItem,
  IconButton,
  List,
  ListItemButton,
  listItemButtonClasses,
  ListItemText,
  listItemSecondaryActionClasses,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Drawer from '@mui/material/Drawer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { SessionListItem, SessionResponse } from '../app.types';
import { importSession } from '../state/store';
import { useAppDispatch } from '../state/hooks';

export interface SessionDrawerProps {
  openSessionSave: () => void;
  openSessionEdit: (sessionData: SessionListItem) => void;
  openSessionDelete: (sessionData: SessionListItem) => void;
  sessionsList: SessionListItem[] | undefined;
  loadedSessionId: string | undefined;
  loadedSessionData: SessionResponse | undefined;
  onChangeLoadedSessionId: (loadedSessionId: string | undefined) => void;
  onChangeLoadedSessionTimestamp: (
    timestamp: string | undefined,
    autoSaved: boolean | undefined
  ) => void;
  onChangeAutoSaveSessionId: (autoSaveSessionId: string | undefined) => void;
}

interface SessionListElementProps extends SessionListItem {
  handleImport: (sessionId: string) => void;
  selected: boolean;
  openSessionEdit: (sessionData: SessionListItem) => void;
  openSessionDelete: (sessionData: SessionListItem) => void;
  onChangeLoadedSessionTimestamp: (
    timestamp: string | undefined,
    autoSaved: boolean | undefined
  ) => void;
  onChangeAutoSaveSessionId: (autoSaveSessionId: string | undefined) => void;
}

function compareSessions(a: SessionListItem, b: SessionListItem): number {
  if (a.auto_saved === b.auto_saved) {
    // If auto_saved is the same, sort by timestamp (you can adjust the sorting criteria)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  }
  // Sort auto_saved=true sessions above auto_saved=false sessions
  return b.auto_saved ? 1 : -1;
}

const SessionListElement = (
  props: SessionListElementProps
): React.ReactElement => {
  const {
    openSessionDelete,
    openSessionEdit,
    selected,
    handleImport,
    onChangeLoadedSessionTimestamp,
    onChangeAutoSaveSessionId,
    ...session
  } = props;
  const prevTimestampRef = React.useRef<string | undefined>(undefined);
  const prevAutoSavedRef = React.useRef<boolean | undefined>(undefined);
  React.useEffect(() => {
    if (selected) {
      // Check if the timestamp and auto_saved values have changed
      if (
        session.timestamp !== prevTimestampRef.current ||
        session.auto_saved !== prevAutoSavedRef.current
      ) {
        // Update the previous values with the current ones
        prevTimestampRef.current = session.timestamp;
        prevAutoSavedRef.current = session.auto_saved;

        // Call the onChangeSelectedSessionTimestamp function
        onChangeLoadedSessionTimestamp(session.timestamp, session.auto_saved);
      }
    }
  }, [onChangeLoadedSessionTimestamp, selected, session]);
  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Box sx={{ whiteSpace: 'nowrap' }}>
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
      }
      sx={{
        [`& > .${listItemButtonClasses.root}`]: {
          paddingRight: '76px',
        },
        [`& .${listItemSecondaryActionClasses.root}`]: {
          right: '8px',
        },
      }}
    >
      <ListItemButton
        selected={selected}
        sx={{
          textDecoration: 'none',
          padding: 1,
        }}
        onClick={() => {
          onChangeAutoSaveSessionId(undefined);
          onChangeLoadedSessionTimestamp(session.timestamp, session.auto_saved);
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
      </ListItemButton>
    </ListItem>
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
    onChangeLoadedSessionTimestamp,
    onChangeAutoSaveSessionId,
    loadedSessionData,
  } = props;

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
        <IconButton aria-label="add user session" onClick={openSessionSave}>
          <AddCircleIcon />
        </IconButton>
      </Box>
    </Box>
  );

  React.useEffect(() => {
    if (loadedSessionData) {
      dispatch(importSession(loadedSessionData.session));
    }
  }, [dispatch, loadedSessionData]);

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
      <List disablePadding aria-label="session list">
        {sessionsList &&
          sessionsList
            .sort(compareSessions)
            .map((item, index) => (
              <SessionListElement
                {...item}
                key={item._id}
                handleImport={handleSessionClick}
                selected={loadedSessionId === item._id}
                openSessionDelete={openSessionDelete}
                openSessionEdit={openSessionEdit}
                onChangeLoadedSessionTimestamp={onChangeLoadedSessionTimestamp}
                onChangeAutoSaveSessionId={onChangeAutoSaveSessionId}
              />
            ))}
      </List>
    </Drawer>
  );
};

export default SessionsDrawer;
