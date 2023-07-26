import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import React, { useState } from 'react';
import { SessionResponse } from '../app.types';
import { useDeleteSession } from '../api/sessions';

export interface DeleteSessionDialogueProps {
  open: boolean;
  onClose: () => void;
  sessionData: SessionResponse | undefined;
  refetchSessionsList: () => void;
}

const DeleteSessionDialogue = (props: DeleteSessionDialogueProps) => {
  const { open, onClose, sessionData, refetchSessionsList } = props;

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteSession } = useDeleteSession();

  const handleDeleteSession = React.useCallback(() => {
    if (sessionData) {
      deleteSession(sessionData)
        .then((response) => {
          refetchSessionsList();
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
  }, [deleteSession, onClose, refetchSessionsList, sessionData]);

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
