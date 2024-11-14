import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
} from '@mui/material';
import React from 'react';
import { useAddFavouriteFilter } from '../api/favouriteFilters';
import { FavouriteFilterPost } from '../app.types';
import { FilterPageHelp } from './filterDialogue.component';
import FilterInput from './filterInput.component';
import { Token } from './filterParser';

export interface FavouriteFiltersDialogueProps {
  open: boolean;
  onClose: () => void;
  channels: Token[];
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
  const { open, onClose, channels } = props;
  const [favouriteFilter, setFavouriteFilter] =
    React.useState<FavouriteFilterTokenised>({ name: '', filter: [] });

  const [favouriteFilterError, setFavouriteFilterError] =
    React.useState<FavouriteFilterError>({
      name: undefined,
      filter: undefined,
    });

  const handleClose = React.useCallback(() => {
    onClose();
    setFavouriteFilterError({ name: undefined, filter: undefined });
    setFavouriteFilter({ name: '', filter: [] });
  }, [onClose]);

  const handleChangeValue = (value: Token[]) =>
    setFavouriteFilter((prevfilter) => ({ ...prevfilter, filter: value }));

  const handleChangeError = (value?: string) =>
    setFavouriteFilterError((prevfilterError) => ({
      ...prevfilterError,
      filter: value,
    }));

  const { mutateAsync: addFavouriteFilter } = useAddFavouriteFilter();

  const handleSubmit = React.useCallback(() => {
    const data: FavouriteFilterPost = {
      name: favouriteFilter.name,
      filter: JSON.stringify(
        favouriteFilter.filter.length === 0 ? '' : favouriteFilter.filter
      ),
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Favourite filter</DialogTitle>
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
          onClick={handleSubmit}
          disabled={
            favouriteFilter.filter.length === 0 ||
            !favouriteFilter.name ||
            !!favouriteFilterError.filter
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FavouriteFiltersDialogue;
