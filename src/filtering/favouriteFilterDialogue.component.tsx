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
import type { AxiosError } from 'axios';
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
import handleOG_APIError from '../handleOG_APIError';
import { FilterPageHelp } from './filterDialogue.component';
import FilterInput from './filterInput.component';
import { Token } from './filterParser';

export interface FavouriteFilterDialogueProps {
  open: boolean;
  onClose: () => void;
  channels: Token[];
  requestType: 'post' | 'patch';
  selectedFavouriteFilter?: FavouriteFilter;
  tokenisedFavouriteFilters: Token[];
  existingFavouriteFilterNames: string[];
}

interface FavouriteFilterTokenised {
  name: string;
  filter: Token[];
}

interface FavouriteFilterError {
  name?: string;
  filter?: string;
}

const FavouriteFilterDialogue = (props: FavouriteFilterDialogueProps) => {
  const {
    open,
    onClose,
    channels,
    requestType,
    selectedFavouriteFilter,
    tokenisedFavouriteFilters,
    existingFavouriteFilterNames,
  } = props;
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

  const updateInputIndex = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    // Check if the modal is open and selectedFavouriteFilter is available
    if (open && selectedFavouriteFilter) {
      const newFilter = JSON.parse(selectedFavouriteFilter.filter) as Token[];
      // Update the favourite filter state
      setFavouriteFilter({
        name: selectedFavouriteFilter.name,
        filter: newFilter,
      });

      // Track the current selectedFavouriteFilter in the ref
      updateInputIndex.current = newFilter.length;
    }
  }, [selectedFavouriteFilter, open, setFavouriteFilter]);

  const handleClose = React.useCallback(() => {
    onClose();
    setFavouriteFilterError({ name: undefined, filter: undefined });
    setFavouriteFilter({ name: '', filter: [] });
    setErrorMessage(undefined);
  }, [onClose]);

  const handleChangeValue = (value: Token[]) => {
    const parsedValue = value.flatMap((token) => {
      if (token.type === 'favouriteFilter') {
        return JSON.parse(token.value) as Token[]; // Parse the value as Token[]
      }
      return token; // Keep other tokens unchanged
    });
    setFavouriteFilter((prevfilter) => ({
      ...prevfilter,
      filter: parsedValue,
    }));
    setErrorMessage(undefined);
  };

  const handleChangeError = (value?: string) =>
    setFavouriteFilterError((prevfilterError) => ({
      ...prevfilterError,
      filter: value,
    }));

  const { mutateAsync: addFavouriteFilter } = useAddFavouriteFilter();
  const { mutateAsync: editFavouriteFilter } = useEditFavouriteFilter();

  const handleDuplicateNameError = React.useCallback(
    (name: string) => {
      let hasError = false;

      if (existingFavouriteFilterNames.includes(name)) {
        hasError = true;
        setFavouriteFilterError((prevError) => ({
          ...prevError,
          name: 'A filter with this name already exists. Please choose a different name.',
        }));
      }
      return hasError;
    },
    [existingFavouriteFilterNames]
  );

  const handleAddSubmit = React.useCallback(() => {
    const data: FavouriteFilterPost = {
      name: favouriteFilter.name,
      filter: JSON.stringify(favouriteFilter.filter),
    };

    const hasError = handleDuplicateNameError(data.name);
    if (hasError) return;

    addFavouriteFilter(data)
      .then(() => {
        handleClose();
      })
      .catch((error: AxiosError) => {
        handleOG_APIError(error);
      });
  }, [
    addFavouriteFilter,
    favouriteFilter.filter,
    favouriteFilter.name,
    handleClose,
    handleDuplicateNameError,
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

      if (isNameUpdated) {
        const hasError = handleDuplicateNameError(data.name);
        if (hasError) return;
        editData.name = data.name;
      }
      if (isFilterUpdated) editData.filter = data.filter;
      if (isNameUpdated || isFilterUpdated) {
        editFavouriteFilter({
          id: selectedFavouriteFilter._id,
          favouriteFilter: editData,
        })
          .then(() => {
            handleClose();
          })
          .catch((error: AxiosError) => {
            handleOG_APIError(error);
          });
      } else {
        setErrorMessage(
          "There have been no changes made. Please change a field's value or press Close to exit."
        );
      }
    }
  }, [
    selectedFavouriteFilter,
    favouriteFilter.name,
    favouriteFilter.filter,
    handleDuplicateNameError,
    editFavouriteFilter,
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
                  setFavouriteFilterError((prevError) => ({
                    ...prevError,
                    name: undefined,
                  }));
                  setErrorMessage(undefined);
                }}
                error={!!favouriteFilterError.name}
                helperText={favouriteFilterError.name}
                size="small"
              />
            </Grid>
            <Grid item>
              <FilterInput
                channels={channels}
                value={favouriteFilter.filter}
                favouriteFilter={tokenisedFavouriteFilters ?? []}
                setValue={handleChangeValue}
                error={favouriteFilterError.filter}
                setError={handleChangeError}
                updateInputIndex={updateInputIndex.current}
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
            !!favouriteFilterError.name ||
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

export default FavouriteFilterDialogue;
