import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import type { AxiosError } from 'axios';
import React from 'react';
import { useDeleteSession } from '../api/sessions';
import { SessionResponse } from '../app.types';

export interface DeleteSessionDialogueProps {
  open: boolean;
  onClose: () => void;
  sessionData: SessionResponse | undefined;
  loadedSessionId: string | undefined;
  onDeleteLoadedSession: () => void;
}

const DeleteSessionDialogue = (props: DeleteSessionDialogueProps) => {
  const { open, onClose, sessionData, loadedSessionId, onDeleteLoadedSession } =
    props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteSession } = useDeleteSession();

  const handleDeleteSession = React.useCallback(() => {
    if (sessionData) {
      deleteSession(sessionData)
        .then(() => {
          if (loadedSessionId === sessionData._id) {
            onDeleteLoadedSession();
          }
          onClose();
        })
        .catch((error: AxiosError) => {
          setErrorMessage((error.response?.data as { detail: string }).detail);
        });
    } else {
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [
    deleteSession,
    loadedSessionId,
    onClose,
    onDeleteLoadedSession,
    sessionData,
  ]);

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <DialogTitle>Delete Session</DialogTitle>
      <DialogContent>
        Are you sure you want to delete{' '}
        <strong data-testid="delete-session-name">{sessionData?.name}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          disabled={errorMessage !== undefined}
          onClick={handleDeleteSession}
        >
          Continue
        </Button>
      </DialogActions>
      {errorMessage !== undefined && (
        <FormHelperText sx={{ textAlign: 'center' }} error>
          {errorMessage}
        </FormHelperText>
      )}
    </Dialog>
  );
};

export default DeleteSessionDialogue;
