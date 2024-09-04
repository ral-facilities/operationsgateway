import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import React, { useState } from 'react';
import { useDeleteSession } from '../api/sessions';
import { SessionResponse } from '../app.types';

export interface DeleteSessionDialogueProps {
  open: boolean;
  onClose: () => void;
  sessionData: SessionResponse | undefined;
  loadedSessionId: string | undefined;
  onDeleteLoadedsession: () => void;
}

const DeleteSessionDialogue = (props: DeleteSessionDialogueProps) => {
  const { open, onClose, sessionData, loadedSessionId, onDeleteLoadedsession } =
    props;

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteSession } = useDeleteSession();

  const handleDeleteSession = React.useCallback(() => {
    if (sessionData) {
      deleteSession(sessionData)
        .then(() => {
          if (loadedSessionId === sessionData._id) {
            onDeleteLoadedsession();
          }
          onClose();
        })
        .catch((error) => {
          setError(true);
          setErrorMessage(error.message);
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [
    deleteSession,
    loadedSessionId,
    onClose,
    onDeleteLoadedsession,
    sessionData,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Delete Session</DialogTitle>
      <DialogContent>
        Are you sure you want to delete{' '}
        <strong data-testid="delete-session-name">{sessionData?.name}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleDeleteSession}>Continue</Button>
        {error && <FormHelperText error>{errorMessage}</FormHelperText>}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSessionDialogue;
