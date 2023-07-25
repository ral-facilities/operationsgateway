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
  onChangeSessionName: (sessionName: string | undefined) => void;
  onChangeSessionSummary: (sessionSummary: string) => void;
}

const SaveSessionDialogue = (props: SessionDialogueProps) => {
  const {
    open,
    onClose,
    sessionName,
    sessionSummary,
    onChangeSessionName,
    onChangeSessionSummary,
  } = props;

  const state = useAppSelector(({ config, ...state }) => state);
  const { mutateAsync: saveSession } = useSaveSession();

  const [nameError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );
  const handleClose = React.useCallback(() => {
    onClose();
    onChangeSessionName(undefined);
    onChangeSessionSummary('');
  }, [onClose, onChangeSessionName, onChangeSessionSummary]);

  const handleExportSession = React.useCallback(() => {
    if (sessionName) {
      const session = {
        name: sessionName,
        session_data: state,
        summary: sessionSummary,
        auto_saved: false,
      };
      saveSession(session)
        .then((response) => handleClose())
        .catch((error) => {
          setError(true);
          console.log(error.message);
          setErrorMessage(error.message);
        });
    } else {
      setError(true);
      setErrorMessage('Please enter a name');
    }
  }, [handleClose, saveSession, sessionName, sessionSummary, state]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Save Session</DialogTitle>
      <DialogContent>
        <TextField
          label="Name*"
          sx={{ width: '100%', margin: '4px' }}
          value={sessionName}
          error={nameError}
          helperText={nameError && errorMessage}
          onChange={(event) => {
            onChangeSessionName(
              event.target.value ? event.target.value : undefined
            );
            setError(false); // Reset the error when the user makes changes
          }}
        />
        <TextField
          label="Summary"
          sx={{ width: '100%', margin: '4px' }}
          multiline
          value={sessionSummary}
          onChange={(event) => {
            onChangeSessionSummary(
              event.target.value ? event.target.value : ''
            );
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
