import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Theme,
  Typography,
  ListItem,
  IconButton,
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
  selectedSessionId: string | undefined;
  onChangeSelectedSessionId: (selectedSessionId: string | undefined) => void;
  onChangeSelectedSessionTimestamp: (
    timestamp: string | undefined,
    autoSaved: boolean | undefined
  ) => void;
  refetchSessionsData: (sessionId: string) => void;
}

interface SessionListElementProps extends SessionListItem {
  handleImport: (sessionId: string) => void;
  selected: boolean;
  openSessionEdit: (sessionData: SessionListItem) => void;
  openSessionDelete: (sessionData: SessionListItem) => void;
  onChangeSelectedSessionTimestamp: (
    timestamp: string | undefined,
    autoSaved: boolean | undefined
  ) => void;
  refetchSessionsData: (sessionId: string) => void;
}

const SessionListElement = (
  props: SessionListElementProps
): React.ReactElement => {
  const {
    openSessionDelete,
    openSessionEdit,
    selected,
    handleImport,
    onChangeSelectedSessionTimestamp,
    refetchSessionsData,
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
        onChangeSelectedSessionTimestamp(session.timestamp, session.auto_saved);
      }
    }
  }, [onChangeSelectedSessionTimestamp, selected, session]);
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        backgroundColor: selected ? 'primary.main' : 'background.paper',
      }}
    >
      <Button
        fullWidth
        sx={{
          display: 'flex',
          backgroundColor: selected ? 'primary.main' : 'background.paper',
          width: '100%',
          margin: '1px',
          textDecoration: 'none',
          color: selected ? 'white' : 'inherit',
        }}
        onClick={() => {
          refetchSessionsData(session._id);
          onChangeSelectedSessionTimestamp(
            session.timestamp,
            session.auto_saved
          );
          handleImport(session._id);
        }}
      >
        <Typography
          variant="button"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {session.name}
        </Typography>
        <Box sx={{ display: 'flex', marginLeft: 'auto' }}>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              openSessionEdit(session);
            }}
            data-testid="edit-session-button"
          >
            <EditIcon sx={{ fontSize: '1em' }} />
          </IconButton>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              openSessionDelete(session);
            }}
            data-testid="delete-session-button"
          >
            <DeleteIcon sx={{ fontSize: '1em' }} />
          </IconButton>
        </Box>
      </Button>
    </Box>
  );
};

const SessionsDrawer = (props: SessionDrawerProps): React.ReactElement => {
  const {
    openSessionSave,
    openSessionDelete,
    openSessionEdit,
    sessionsList,
    selectedSessionId,
    onChangeSelectedSessionId,
    onChangeSelectedSessionTimestamp,
    refetchSessionsData,
  } = props;

  const { data: sessionData } = useSession(selectedSessionId);
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
    onChangeSelectedSessionId(undefined);
    onChangeSelectedSessionId(sessionId);
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
        <Box>
          {sessionsList &&
            sessionsList.map((item, index) => (
              <ListItem key={item._id} alignItems="flex-start">
                <SessionListElement
                  {...item}
                  handleImport={handleSessionClick}
                  selected={selectedSessionId === item._id}
                  openSessionDelete={openSessionDelete}
                  openSessionEdit={openSessionEdit}
                  onChangeSelectedSessionTimestamp={
                    onChangeSelectedSessionTimestamp
                  }
                  refetchSessionsData={refetchSessionsData}
                />
              </ListItem>
            ))}
        </Box>
      </StyledDrawer>
    </div>
  );
};

export default SessionsDrawer;
