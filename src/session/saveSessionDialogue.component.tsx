import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { useAppSelector } from '../state/hooks';
import { useSaveSession } from '../api/sessions';

export interface SessionDialogueProps {
  open: boolean;
  onClose: () => void;
  sessionName: string | undefined;
  sessionSummary: string;
  setSessionName: (sessionName: string | undefined) => void;
  setSessionSummary: (sessionSummary: string) => void;
}

const SaveSessionDialogue = (props: SessionDialogueProps) => {
  const {
    open,
    onClose,
    sessionName,
    sessionSummary,
    setSessionName,
    setSessionSummary,
  } = props;

  const state = useAppSelector(({ config, ...state }) => state);
  const { mutate: saveSession } = useSaveSession();

  const [nameError, setNameError] = useState(false);

  const handleExportSession = React.useCallback(() => {
    if (sessionName) {
      const session = {
        name: sessionName,
        session_data: JSON.stringify(state),
        summary: sessionSummary,
        auto_saved: false,
      };
      saveSession(session);
      onClose();
    } else {
      setNameError(true);
    }
  }, [onClose, saveSession, sessionName, sessionSummary, state]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Save Session</DialogTitle>
      <DialogContent>
        <TextField
          label="Name*"
          sx={{ width: '100%', margin: '4px' }}
          value={sessionName}
          error={nameError}
          helperText={nameError && 'Please enter a name'}
          onChange={(event) => {
            setSessionName(event.target.value ? event.target.value : undefined);
            setNameError(false); // Reset the error when the user makes changes
          }}
        />
        <TextField
          label="Summary"
          sx={{ width: '100%', margin: '4px' }}
          multiline
          value={sessionSummary}
          onChange={(event) => {
            setSessionSummary(event.target.value ? event.target.value : '');
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleExportSession}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveSessionDialogue;
