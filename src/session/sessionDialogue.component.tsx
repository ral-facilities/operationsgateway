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
import { useEditSession, useSaveSession } from '../api/sessions';
import { Session } from '../app.types';

export interface SessionDialogueProps {
  open: boolean;
  onClose: () => void;
  sessionName: string | undefined;
  sessionSummary: string;
  onChangeSessionName: (sessionName: string | undefined) => void;
  onChangeSessionSummary: (sessionSummary: string) => void;
  requestType: 'edit' | 'create';
  onChangeSelectedSessionId: (selectedSessionId: string | undefined) => void;
  refetchSessionsList: () => void;
  sessionData?: Session;
}

const SessionDialogue = (props: SessionDialogueProps) => {
  const {
    open,
    onClose,
    sessionName,
    sessionSummary,
    onChangeSessionName,
    onChangeSessionSummary,
    requestType,
    sessionData,
    onChangeSelectedSessionId,
    refetchSessionsList,
  } = props;

  const state = useAppSelector(({ config, ...state }) => state);

  const { mutateAsync: saveSession } = useSaveSession();
  const { mutateAsync: editSession } = useEditSession();

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );
  const handleClose = React.useCallback(() => {
    onChangeSessionName(undefined);
    onChangeSessionSummary('');
    onClose();
  }, [onChangeSessionName, onChangeSessionSummary, onClose]);

  const handleExportCreateSession = React.useCallback(() => {
    if (sessionName) {
      const session = {
        name: sessionName,
        session_data: state,
        summary: sessionSummary,
        auto_saved: false,
      };
      saveSession(session)
        .then((response) => {
          refetchSessionsList();
          onChangeSelectedSessionId(response);
          handleClose();
        })
        .catch((error) => {
          setError(true);
          console.log(error.message);
          setErrorMessage(error.message);
        });
    } else {
      setError(true);
      setErrorMessage('Please enter a name');
    }
  }, [
    handleClose,
    onChangeSelectedSessionId,
    refetchSessionsList,
    saveSession,
    sessionName,
    sessionSummary,
    state,
  ]);

  const handleExportEditSession = React.useCallback(() => {
    if (sessionName && sessionData) {
      const session = {
        name: sessionName,
        summary: sessionSummary,
        auto_saved: false,
        _id: sessionData._id,
      };
      editSession(session)
        .then((response) => {
          refetchSessionsList();
          handleClose();
        })
        .catch((error) => {
          setError(true);
          console.log(error.message);
          setErrorMessage(error.message);
        });
    } else {
      setError(true);
      setErrorMessage('Please enter a name');
    }
  }, [
    sessionName,
    sessionData,
    sessionSummary,
    editSession,
    refetchSessionsList,
    handleClose,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>
        {requestType === 'create' ? 'Save Session' : 'Edit Session'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name*"
          sx={{ width: '100%', margin: '4px' }}
          value={sessionName}
          error={error}
          helperText={error && errorMessage}
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
        <Button onClick={handleClose}>Close</Button>
        <Button
          onClick={
            requestType === 'create'
              ? handleExportCreateSession
              : handleExportEditSession
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionDialogue;
