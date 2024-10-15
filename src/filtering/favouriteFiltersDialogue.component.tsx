import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormHelperText,
  Grid,
  TextField,
} from '@mui/material';
import React from 'react';
import {
  useAddFavouriteFilter,
  useEditFavouriteFilter,
} from '../api/favouriteFilters';
import {
  FavouriteFilter,
  FavouriteFilterPatch,
  FavouriteFilterPost,
} from '../app.types';
import { FilterPageHelp } from './filterDialogue.component';
import FilterInput from './filterInput.component';
import { Token } from './filterParser';

export interface FavouriteFiltersDialogueProps {
  open: boolean;
  onClose: () => void;
  channels: Token[];
  requestType: 'post' | 'patch';
  selectedFavouriteFilter?: FavouriteFilter;
}

interface FavouriteFilterTokenised {
  name: string;
  filter: Token[];
}

interface FavouriteFilterError {
  name?: string;
  filter?: string;
}

const FavouriteFiltersDialogue = (props: FavouriteFiltersDialogueProps) => {
  const { open, onClose, channels, requestType, selectedFavouriteFilter } =
    props;
  const [favouriteFilter, setFavouriteFilter] =
    React.useState<FavouriteFilterTokenised>({ name: '', filter: [] });
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const [favouriteFilterError, setFavouriteFilterError] =
    React.useState<FavouriteFilterError>({
      name: undefined,
      filter: undefined,
    });

  React.useEffect(() => {
    if (open && selectedFavouriteFilter) {
      setFavouriteFilter({
        name: selectedFavouriteFilter.name,
        filter: JSON.parse(selectedFavouriteFilter.filter) as Token[],
      });
    }
  }, [selectedFavouriteFilter, open]);

  const handleClose = React.useCallback(() => {
    onClose();
    setFavouriteFilterError({ name: undefined, filter: undefined });
    setFavouriteFilter({ name: '', filter: [] });
    setErrorMessage(undefined);
  }, [onClose]);

  const handleChangeValue = (value: Token[]) => {
    setFavouriteFilter((prevfilter) => ({ ...prevfilter, filter: value }));
    setErrorMessage(undefined);
  };

  const handleChangeError = (value?: string) =>
    setFavouriteFilterError((prevfilterError) => ({
      ...prevfilterError,
      filter: value,
    }));

  const { mutateAsync: addFavouriteFilter } = useAddFavouriteFilter();
  const { mutateAsync: editFavouriteFilter } = useEditFavouriteFilter();

  const handleAddSubmit = React.useCallback(() => {
    const data: FavouriteFilterPost = {
      name: favouriteFilter.name,
      filter: JSON.stringify(favouriteFilter.filter),
    };

    addFavouriteFilter(data).then(() => {
      handleClose();
    });
  }, [
    addFavouriteFilter,
    favouriteFilter.filter,
    favouriteFilter.name,
    handleClose,
  ]);

  const handleEditSubmit = React.useCallback(() => {
    if (selectedFavouriteFilter) {
      const data: FavouriteFilterPost = {
        name: favouriteFilter.name,
        filter: JSON.stringify(favouriteFilter.filter),
      };

      const isNameUpdated = selectedFavouriteFilter.name !== data.name;

      const isFilterUpdated = selectedFavouriteFilter.filter !== data.filter;

      const editData: FavouriteFilterPatch = {};

      if (isNameUpdated) editData.name = data.name;
      if (isFilterUpdated) editData.filter = data.filter;
      if (isNameUpdated || isFilterUpdated) {
        editFavouriteFilter({
          id: selectedFavouriteFilter._id,
          favouriteFilter: editData,
        }).then(() => {
          handleClose();
        });
      } else {
        setErrorMessage(
          "There have been no changes made. Please change a field's value or press Close to exit."
        );
      }
    }
  }, [
    editFavouriteFilter,
    selectedFavouriteFilter,
    favouriteFilter,
    handleClose,
  ]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {requestType === 'post' ? 'Add' : 'Edit'} Favourite filter
      </DialogTitle>
      <DialogContent>
        <Grid container sx={{ mt: 1 }}>
          <Grid
            container
            item
            xs={12}
            sm={6}
            flexDirection={'column'}
            spacing={1}
          >
            <Grid item>
              <TextField
                fullWidth
                label="Name"
                value={favouriteFilter.name}
                onChange={(e) => {
                  setFavouriteFilter((prevfilter) => ({
                    ...prevfilter,
                    name: e.target.value,
                  }));
                  setErrorMessage(undefined);
                }}
                size="small"
              />
            </Grid>
            <Grid item>
              <FilterInput
                channels={channels}
                value={favouriteFilter.filter}
                setValue={handleChangeValue}
                error={favouriteFilterError.filter}
                setError={handleChangeError}
              />
            </Grid>
          </Grid>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <FilterPageHelp />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          onClick={requestType === 'post' ? handleAddSubmit : handleEditSubmit}
          disabled={
            favouriteFilter.filter.length === 0 ||
            !favouriteFilter.name ||
            !!favouriteFilterError.filter ||
            errorMessage !== undefined
          }
        >
          Save
        </Button>
      </DialogActions>

      {errorMessage && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ marginBottom: 2, textAlign: 'center' }} error>
            {errorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default FavouriteFiltersDialogue;
