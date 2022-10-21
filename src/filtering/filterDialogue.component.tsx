import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import FilterInput from './filterInput.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  changeAppliedFilters,
  selectAppliedFilters,
} from '../state/slices/filterSlice';
import { Token } from './filterParser';
import { useChannels } from '../api/channels';

interface FilterDialogueProps {
  open: boolean;
  onClose: () => void;
}

const Heading = (props: React.ComponentProps<typeof Typography>) => (
  <Typography
    variant="body1"
    component="h3"
    gutterBottom
    sx={{ fontWeight: 'bold' }}
  >
    {props.children}
  </Typography>
);
const Body = (props: React.ComponentProps<typeof Typography>) => (
  <Typography variant="body2" gutterBottom>
    {props.children}
  </Typography>
);

const FilterDialogue = (props: FilterDialogueProps) => {
  const { open, onClose } = props;
  const dispatch = useAppDispatch();
  const appliedFilters = useAppSelector(selectAppliedFilters);
  const [filters, setFilters] = React.useState<Token[][]>(appliedFilters);
  const [errors, setErrors] = React.useState<string[]>(['']);
  const { data: channels } = useChannels({
    select: (channels) => {
      return (
        channels
          // TODO: I think it makes sense that we can only apply filters to scalar channels, but should check
          // should also check we want friendly names here instead of system names
          .filter((channel) => channel.channel_dtype === 'scalar')
          .map(
            (channel) =>
              ({
                type: 'channel',
                value: channel.systemName,
                label: channel?.userFriendlyName ?? channel.systemName,
              } as Token)
          )
      );
    },
  });

  React.useEffect(() => {
    setFilters(appliedFilters);
    setErrors(['']);
  }, [appliedFilters]);

  const handleChangeValue = React.useCallback(
    (value: Token[]) => setFilters([value]),
    []
  );
  const handleChangeError = React.useCallback(
    (error: string) => setErrors([error]),
    []
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid item xs pr={1}>
            <Heading>Enter filter</Heading>
            <Grid container item>
              <FilterInput
                channels={channels ?? []}
                value={filters[0]}
                setValue={handleChangeValue}
                error={errors[0]}
                setError={handleChangeError}
              />
            </Grid>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs>
            <Heading>Filter help</Heading>
            <Body>
              In the box, start typing data channel names, numbers, mathematical
              symbols such as {'>'} and {'<='} and keywords such as AND, OR and
              NOT. The Wizard will suggest suitable options and indicate using a
              grey box when each item has been recognised.
            </Body>
            <Heading>Operators included</Heading>
            <Body>
              {'=, !=, >, <, >=, <=, is null, is not null, and, or, not, (, )'}
            </Body>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          disabled={errors.some((e) => e.length !== 0)}
          onClick={() => {
            dispatch(changeAppliedFilters(filters));
            onClose();
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialogue;
