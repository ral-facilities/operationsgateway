import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { useDeleteUser } from '../../api/user';
import { APIError, User } from '../../app.types';

export interface DeleteUserDialogueProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User;
}

const DeleteUserDialogue = (props: DeleteUserDialogueProps) => {
  const { open, onClose, selectedUser } = props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteUser } = useDeleteUser();

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  const handleDeleteUser = React.useCallback(() => {
    deleteUser(selectedUser.username)
      .then(() => {
        handleClose();
      })
      .catch((error: AxiosError) => {
        const errorDetail = (error.response?.data as APIError).detail;
        setErrorMessage(errorDetail as string);
      });
  }, [deleteUser, handleClose, selectedUser]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        Are you sure you want to delete{' '}
        <strong data-testid="delete-user-name">{selectedUser?.username}</strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handleDeleteUser}>Continue</Button>
        {errorMessage !== undefined && (
          <FormHelperText error>{errorMessage}</FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialogue;
