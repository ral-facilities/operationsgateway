import React from 'react';
import Box from '@mui/material/Box';
import { Button, Typography } from '@mui/material';
import { SessionResponse } from '../app.types';
import { useAppSelector } from '../state/hooks';
import { useEditSession, useSaveSession } from '../api/sessions';
import { format, parseISO } from 'date-fns';
import { ImportSessionType } from '../state/store';

export interface SessionsSaveButtonsProps {
  onSaveAsSessionClick: () => void;
  loadedSessionData: SessionResponse | undefined;
  loadedSessionTimestamp: {
    timestamp: string | undefined;
    autoSaved: boolean | undefined;
  };
  autoSaveSessionId: string | undefined;
  onChangeAutoSaveSessionId: (autoSaveSessionId: string | undefined) => void;
}

export const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000;

const formatDate = (inputDate: string) => {
  const date = parseISO(inputDate);
  const formattedDate = format(date, 'dd MMM yyyy HH:mm');
  return formattedDate;
};

const SessionSaveButtons = (props: SessionsSaveButtonsProps) => {
  const {
    onSaveAsSessionClick,
    loadedSessionData,
    loadedSessionTimestamp,
    autoSaveSessionId,
    onChangeAutoSaveSessionId,
  } = props;

  const { mutate: editSession } = useEditSession();
  const { mutateAsync: saveSession } = useSaveSession();

  const autoSaveTimeout = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const state = useAppSelector(({ config, ...state }) => state);

  const prevReduxState = React.useRef<ImportSessionType | null>(null); // Initialize with null

  // Update the previous state when the state changes
  React.useEffect(() => {
    prevReduxState.current = state;
  }, [state]);

  const handleSaveSession = React.useCallback(() => {
    if (loadedSessionData) {
      const session = {
        session: state,
        auto_saved: false,
        _id: loadedSessionData._id,
        summary: loadedSessionData.summary,
        timestamp: loadedSessionData.timestamp,
        name: loadedSessionData.name,
      };
      editSession(session);
    } else {
      onSaveAsSessionClick();
    }
  }, [loadedSessionData, state, editSession, onSaveAsSessionClick]);

  React.useEffect(() => {
    let autoSaveTimer: ReturnType<typeof setInterval> | null;
    autoSaveTimer = null;
    if (autoSaveTimeout.current) {
      clearInterval(autoSaveTimeout.current);
    }

    if (loadedSessionData && !loadedSessionData.auto_saved) {
      autoSaveTimer = setInterval(() => {
        const sessionData = {
          name: `${loadedSessionData.name} (autosaved)`,
          session: prevReduxState.current ?? state,
          summary: loadedSessionData.summary,
          auto_saved: true,
        };
        if (!autoSaveSessionId) {
          saveSession(sessionData).then((repsonse) => {
            onChangeAutoSaveSessionId(repsonse);
          });
        } else {
          editSession({
            _id: autoSaveSessionId,
            timestamp: loadedSessionData.timestamp,
            ...sessionData,
          });
        }
      }, AUTO_SAVE_INTERVAL_MS);
    }

    // Update the autoSaveTimeout ref after setting the interval
    autoSaveTimeout.current = autoSaveTimer;

    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveSessionId, loadedSessionData]);

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
        <Typography
          data-testid="session-save-buttons-timestamp"
          style={{ fontSize: 'small', margin: '8px' }}
        >
          {loadedSessionTimestamp.autoSaved !== undefined
            ? loadedSessionTimestamp.autoSaved
              ? 'Session last autosaved: '
              : 'Session last saved: '
            : ''}
          <span style={{ fontWeight: 'bold' }}>
            {loadedSessionTimestamp.timestamp !== undefined
              ? formatDate(loadedSessionTimestamp.timestamp)
              : ''}
          </span>
        </Typography>
        <Button
          sx={{ mx: '4px' }}
          onClick={handleSaveSession}
          variant="outlined"
        >
          Save
        </Button>
        <Button
          sx={{ mx: '4px' }}
          onClick={onSaveAsSessionClick}
          variant="outlined"
        >
          Save as
        </Button>
      </Box>
    </Box>
  );
};

export default SessionSaveButtons;
