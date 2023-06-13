import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import React from 'react';
import { useAppSelector } from '../state/hooks';

interface SessionDialogueProps {
  open: boolean;
  onClose: () => void;
  setSavedSession: (session: string | undefined) => void;
  sessionName: string | undefined;
  sessionSummary: string | undefined;
  setSessionName: (session: string | undefined) => void;
  setSessionSummary: (session: string | undefined) => void;
}

const SessionDialogue = (props: SessionDialogueProps) => {
  const {
    open,
    onClose,
    setSavedSession,
    sessionName,
    sessionSummary,
    setSessionName,
    setSessionSummary,
  } = props;

  const state = useAppSelector(({ config, ...state }) => state);

  const handleExportSession = React.useCallback(() => {
    const session = {
      ...{ name: sessionName },
      ...{ session_data: state },
      ...{ summary: sessionSummary },
      ...{ auto_saved: true },
    };
    setSavedSession(JSON.stringify(session));
    onClose();
  }, [onClose, sessionName, sessionSummary, setSavedSession, state]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Save Session</DialogTitle>
      <DialogContent>
        <TextField
          label="Name*"
          sx={{ width: '100%', margin: '4px' }}
          value={sessionName}
          onChange={(event) => {
            setSessionName(event.target.value ? event.target.value : undefined);
          }}
        />
        <TextField
          label="Summary"
          sx={{ width: '100%', margin: '4px' }}
          multiline
          value={sessionSummary}
          onChange={(event) => {
            setSessionSummary(
              event.target.value ? event.target.value : undefined
            );
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleExportSession}> Save </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionDialogue;
