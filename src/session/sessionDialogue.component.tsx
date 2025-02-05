import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { AxiosError } from 'axios';
import React from 'react';
import { shallowEqual } from 'react-redux';
import { useEditSession, useSaveSession } from '../api/sessions';
import { SessionResponse } from '../app.types';
import handleOG_APIError from '../handleOG_APIError';
import { useUpdateWindowPositions } from '../hooks';
import { sessionSelector, useAppSelector } from '../state/hooks';

export interface SessionDialogueProps {
  open: boolean;
  onClose: () => void;
  sessionName: string | undefined;
  sessionSummary: string;
  onChangeSessionName: (sessionName: string | undefined) => void;
  onChangeSessionSummary: (sessionSummary: string) => void;
  requestType: 'edit' | 'create';
  onChangeLoadedSessionId: (loadedSessionId: string | undefined) => void;
  onChangeAutoSaveSessionId: (autoSaveSessionId: string | undefined) => void;
  sessionData?: SessionResponse;
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
    onChangeLoadedSessionId,
    onChangeAutoSaveSessionId,
  } = props;

  const state = useAppSelector(sessionSelector, shallowEqual);

  const { mutateAsync: saveSession } = useSaveSession();
  const { mutateAsync: editSession } = useEditSession();

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );
  const handleClose = React.useCallback(() => {
    onChangeSessionName(undefined);
    onChangeSessionSummary('');
    onClose();
  }, [onChangeSessionName, onChangeSessionSummary, onClose]);

  const updateWindowPositions = useUpdateWindowPositions();

  const handleExportCreateSession = React.useCallback(() => {
    if (sessionName) {
      const sessionState = updateWindowPositions(state);

      const session = {
        name: sessionName,
        session: sessionState,
        summary: sessionSummary,
        auto_saved: false,
      };
      saveSession(session)
        .then((response) => {
          onChangeAutoSaveSessionId(undefined);
          onChangeLoadedSessionId(response);
          handleClose();
        })
        .catch((error: AxiosError) => {
          handleOG_APIError(error);
        });
    } else {
      setErrorMessage('Please enter a name');
    }
  }, [
    handleClose,
    onChangeAutoSaveSessionId,
    onChangeLoadedSessionId,
    saveSession,
    sessionName,
    sessionSummary,
    state,
    updateWindowPositions,
  ]);

  const handleExportEditSession = React.useCallback(() => {
    if (sessionName && sessionData) {
      const session = {
        name: sessionName,
        summary: sessionSummary,
        auto_saved: false,
        _id: sessionData._id,
        session: sessionData.session,
        timestamp: sessionData.timestamp,
      };

      editSession(session)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          handleOG_APIError(error);
        });
    } else {
      setErrorMessage('Please enter a name');
    }
  }, [sessionName, sessionData, sessionSummary, editSession, handleClose]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {requestType === 'create' ? 'Save Session' : 'Edit Session'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          required={true}
          sx={{ width: '100%', mt: 1 }}
          value={sessionName ?? ''}
          error={!!errorMessage}
          helperText={errorMessage}
          onChange={(event) => {
            onChangeSessionName(
              event.target.value ? event.target.value : undefined
            );
            setErrorMessage(undefined); // Reset the error when the user makes changes
          }}
        />
        <TextField
          label="Summary"
          sx={{ width: '100%', mt: 1 }}
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
          disabled={errorMessage !== undefined}
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
