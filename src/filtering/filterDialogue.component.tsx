import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
  Tooltip,
  Box,
} from '@mui/material';
import React from 'react';
import FilterInput from './filterInput.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  changeAppliedFilters,
  selectAppliedFilters,
} from '../state/slices/filterSlice';
import { Token, parseFilter } from './filterParser';
import { useChannels } from '../api/channels';
import { AddCircle, Delete, Warning } from '@mui/icons-material';
import { useIncomingRecordCount } from '../api/records';
import { selectRecordLimitWarning } from '../state/slices/configSlice';
import { useQueryClient } from '@tanstack/react-query';
import { selectSearchParams } from '../state/slices/searchSlice';

interface FilterDialogueProps {
  open: boolean;
  onClose: () => void;
  flashingFilterValue?: string;
}

const Heading = (props: React.ComponentProps<typeof Typography>) => {
  const { children, ref, ...restProps } = props;
  return (
    <Typography
      variant="body1"
      component="h3"
      gutterBottom
      sx={{ fontWeight: 'bold' }}
      {...restProps}
    >
      {children}
    </Typography>
  );
};
const Body = (props: React.ComponentProps<typeof Typography>) => (
  <Typography variant="body2" gutterBottom>
    {props.children}
  </Typography>
);

const FilterDialogue = (props: FilterDialogueProps) => {
  const { open, onClose, flashingFilterValue } = props;
  const dispatch = useAppDispatch();
  const appliedFilters = useAppSelector(selectAppliedFilters);
  // we need searchParams so we can check for past queries before showing the warning message
  const searchParams = useAppSelector(selectSearchParams);
  const [filters, setFilters] = React.useState<Token[][]>(appliedFilters);
  const [errors, setErrors] = React.useState<string[]>(
    appliedFilters.map(() => '')
  );
  const { data: channels } = useChannels({
    select: (channels) => {
      return channels
        .filter(
          (channel) =>
            channel.type === 'scalar' && channel.systemName !== 'timestamp'
        )
        .map(
          (channel) =>
            ({
              type: 'channel',
              value: channel.systemName,
              label: channel?.name ?? channel.systemName,
            } as Token)
        );
    },
  });

  React.useEffect(() => {
    setFilters(appliedFilters);
    setErrors(appliedFilters.map(() => ''));
  }, [appliedFilters]);

  const handleChangeValue = React.useCallback(
    (index: number) => (value: Token[]) =>
      setFilters((filters) => {
        return [...filters.slice(0, index), value, ...filters.slice(index + 1)];
      }),
    []
  );
  const handleChangeError = React.useCallback(
    (index: number) => (value: string) =>
      setErrors((errors) => {
        return [...errors.slice(0, index), value, ...errors.slice(index + 1)];
      }),
    []
  );

  const recordLimitWarning = useAppSelector(selectRecordLimitWarning);

  const [displayingWarningMessage, setDisplayingWarningMessage] =
    React.useState<boolean>(false);

  const [incomingFilters, setIncomingFilters] = React.useState<string[]>(
    appliedFilters.map((f) => parseFilter(f))
  );

  const { data: incomingCount, isLoading: countLoading } =
    useIncomingRecordCount(incomingFilters, undefined);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    setDisplayingWarningMessage(false);
  }, [filters]);

  const overRecordLimit = React.useCallback((): boolean => {
    return (
      !countLoading &&
      incomingCount !== undefined &&
      recordLimitWarning > -1 &&
      incomingCount > recordLimitWarning
    );
  }, [countLoading, incomingCount, recordLimitWarning]);

  const applyFilters = React.useCallback(() => {
    // remove any "empty" filters as they're not necessary
    // just need to make sure there's at least one empty array in the
    // case of no filters applied
    let newFilters = filters.filter((f) => f.length > 0);
    if (newFilters.length === 0) newFilters = [[]];

    const incomingFilters = newFilters.map((f) => parseFilter(f));
    setIncomingFilters(incomingFilters);
    if (
      !displayingWarningMessage &&
      overRecordLimit() && // search for if we have previously made a search with these params
      // use exact: false to ignore things like sort, pagination etc.
      queryClient.getQueriesData({
        exact: false,
        queryKey: [
          'records',
          { filters: incomingFilters, searchParams: searchParams },
        ],
      }).length === 0
    ) {
      setDisplayingWarningMessage(true);
      return;
    }

    setDisplayingWarningMessage(false);
    dispatch(changeAppliedFilters(newFilters));
    onClose();
  }, [
    dispatch,
    displayingWarningMessage,
    filters,
    onClose,
    overRecordLimit,
    queryClient,
    searchParams,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid container item xs pr={1} flexDirection="column" rowSpacing={1}>
            <Heading mt={1}>Enter filter</Heading>
            {filters.map((filter, index) => (
              <Grid container item key={index}>
                <Grid item xs>
                  <FilterInput
                    channels={channels ?? []}
                    value={filter}
                    setValue={handleChangeValue(index)}
                    error={errors[index]}
                    setError={handleChangeError(index)}
                    flashingFilterValue={flashingFilterValue}
                  />
                </Grid>
                <Grid item xs={0.6} mt={0.5}>
                  <IconButton
                    onClick={() => {
                      setFilters((filters) =>
                        filters.filter((_, i) => i !== index)
                      );
                      setErrors((errors) =>
                        errors.filter((_, i) => i !== index)
                      );
                    }}
                    size="small"
                    aria-label={`Delete filter ${index}`}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Grid item>
              <Button
                onClick={() => {
                  setFilters((filters) => [...filters, []]);
                  setErrors((errors) => [...errors, '']);
                }}
                variant="outlined"
                size="small"
                startIcon={<AddCircle />}
              >
                Add new filter
              </Button>
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
        {displayingWarningMessage ? (
          <Tooltip
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'yellow',
                  color: 'black',
                  border: '1px solid black',
                },
              },
            }}
            arrow
            placement="bottom"
            title={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <Warning sx={{ fontSize: 25, padding: '10px 5px 5px 0px' }} />
                <div>
                  <Typography variant="caption" align="center">
                    {`This search will return over ${recordLimitWarning}
                      results.`}
                  </Typography>
                  <br />
                  <Typography variant="caption" align="center">
                    Click Apply again to continue
                  </Typography>
                </div>
              </Box>
            }
          >
            <Button
              disabled={errors.some((e) => e.length !== 0)}
              onClick={() => applyFilters()}
            >
              Apply
            </Button>
          </Tooltip>
        ) : (
          <Button
            disabled={errors.some((e) => e.length !== 0)}
            onClick={() => applyFilters()}
          >
            Apply
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialogue;
