import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import React from 'react';

import { AxiosError } from 'axios';
import { useDeleteFavouriteFilter } from '../api/favouriteFilters';
import { FavouriteFilter } from '../app.types';

export interface DeleteFavouriteFilterDialogueProps {
  open: boolean;
  onClose: () => void;
  favouriteFilter: FavouriteFilter | undefined;
}

const DeleteFavouriteFilterDialogue = (
  props: DeleteFavouriteFilterDialogueProps
) => {
  const { open, onClose, favouriteFilter } = props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  const { mutateAsync: deleteFavouriteFilter } = useDeleteFavouriteFilter();

  const handleDeleteFavouriteFilter = React.useCallback(() => {
    if (favouriteFilter) {
      deleteFavouriteFilter(favouriteFilter._id)
        .then(() => {
          handleClose();
        })
        .catch((error: AxiosError) => {
          setErrorMessage((error.response?.data as { detail: string }).detail);
        });
    } else {
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [deleteFavouriteFilter, handleClose, favouriteFilter]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <DialogTitle>Delete Favourite filter</DialogTitle>
      <DialogContent>
        Are you sure you want to delete{' '}
        <strong data-testid="delete-favourite-filter-name">
          {favouriteFilter?.name}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          disabled={errorMessage !== undefined}
          onClick={handleDeleteFavouriteFilter}
        >
          Continue
        </Button>
      </DialogActions>
      {errorMessage !== undefined && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ textAlign: 'center' }} error>
            {errorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default DeleteFavouriteFilterDialogue;
