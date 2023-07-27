import React from 'react';
import Box from '@mui/material/Box';
import { Button, Typography } from '@mui/material';
import { SessionResponse } from '../app.types';
import { useAppSelector } from '../state/hooks';
import { useEditSession } from '../api/sessions';
import { format, parseISO } from 'date-fns';

export interface SessionsSaveButtonsProps {
  sessionId: string | undefined;
  onSaveAsSessionClick: () => void;
  selectedSessionData: SessionResponse | undefined;
  selectedSessionTimestamp: {
    timestamp: string | undefined;
    autoSaved: boolean | undefined;
  };
  refetchSessionsList: () => void;
}

export const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000;

const SessionSaveButtons = (props: SessionsSaveButtonsProps) => {
  const {
    onSaveAsSessionClick,
    selectedSessionData,
    selectedSessionTimestamp,
    refetchSessionsList,
    sessionId,
  } = props;

  const { mutateAsync: editSession } = useEditSession();

  const autoSaveTimeout = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const state = useAppSelector(({ config, ...state }) => state);
  const handleSaveSession = React.useCallback(() => {
    if (selectedSessionData) {
      const session = {
        session: state,
        auto_saved: false,
        _id: selectedSessionData._id,
        summary: selectedSessionData.summary,
        timestamp: selectedSessionData.timestamp,
        name: selectedSessionData.name,
      };
      editSession(session).then((response) => {
        refetchSessionsList();
      });
    } else {
      onSaveAsSessionClick();
    }
  }, [
    editSession,
    onSaveAsSessionClick,
    refetchSessionsList,
    selectedSessionData,
    state,
  ]);

  React.useEffect(() => {
    let autoSaveTimer: ReturnType<typeof setInterval> | null;
    autoSaveTimer = null;
    if (autoSaveTimeout.current) {
      clearInterval(autoSaveTimeout.current);
    }

    if (selectedSessionData) {
      autoSaveTimer = setInterval(() => {
        const session = {
          session: state,
          auto_saved: true,
          _id: selectedSessionData._id,
          summary: selectedSessionData.summary,
          timestamp: selectedSessionData.timestamp,
          name: selectedSessionData.name,
        };
        editSession(session).then((response) => {
          refetchSessionsList();
        });
      }, AUTO_SAVE_INTERVAL_MS);
    }

    // Update the autoSaveTimeout ref after setting the interval
    autoSaveTimeout.current = autoSaveTimer;

    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [
    editSession,
    handleSaveSession,
    refetchSessionsList,
    selectedSessionData,
    sessionId,
    state,
  ]);

  let timestamp;
  timestamp = undefined;

  const formatDate = (inputDate: string) => {
    console.log(inputDate);
    const date = parseISO(inputDate);
    console.log(date);
    const formattedDate = format(date, 'dd MMM yyyy HH:mm');
    return formattedDate;
  };

  if (selectedSessionTimestamp.timestamp) {
    timestamp = formatDate(selectedSessionTimestamp.timestamp);
  }
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
          {selectedSessionTimestamp.autoSaved !== undefined
            ? selectedSessionTimestamp.autoSaved
              ? 'Session last autosaved: '
              : 'Session last saved: '
            : ''}
          <span style={{ fontWeight: 'bold' }}>
            {timestamp !== undefined ? timestamp : ''}
          </span>
        </Typography>
        <Button onClick={handleSaveSession} variant="outlined">
          Save
        </Button>
        <Button onClick={onSaveAsSessionClick} variant="outlined">
          Save as
        </Button>
      </Box>
    </Box>
  );
};

export default SessionSaveButtons;
