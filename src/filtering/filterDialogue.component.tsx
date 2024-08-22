import { AddCircle, Delete, Warning } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useChannels } from '../api/channels';
import { useIncomingRecordCount } from '../api/records';
import { timeChannelName } from '../app.types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectRecordLimitWarning } from '../state/slices/configSlice';
import {
  changeAppliedFilters,
  selectAppliedFilters,
} from '../state/slices/filterSlice';
import { selectSearchParams } from '../state/slices/searchSlice';
import FilterInput from './filterInput.component';
import { Token, parseFilter } from './filterParser';

interface FilterDialogueProps {
  open: boolean;
  onClose: () => void;
  flashingFilterValue?: string;
}

export const Heading = (props: React.ComponentProps<typeof Typography>) => {
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
export const Body = (props: React.ComponentProps<typeof Typography>) => (
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
            channel.type === 'scalar' && channel.systemName !== timeChannelName
        )
        .map(
          (channel) =>
            ({
              type: 'channel',
              value: channel.systemName,
              label: channel?.name ?? channel.systemName,
            }) as Token
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
      searchParams.maxShots > recordLimitWarning &&
      incomingCount > recordLimitWarning
    );
  }, [countLoading, incomingCount, recordLimitWarning, searchParams.maxShots]);

  // remove any "empty" filters as they're not necessary
  // just need to make sure there's at least one empty array in the
  // case of no filters applied
  let newFilters = filters.filter((f) => f.length > 0);
  if (newFilters.length === 0) newFilters = [[]];

  const applyFilters = React.useCallback(() => {
    const incomingFilters = newFilters.map((f) => parseFilter(f));
    setIncomingFilters(incomingFilters);

    // if the user re-clicks the button after the warning message is displayed
    // or if the user has already fetched the data they're requesting
    // update the applied filters
    if (
      displayingWarningMessage ||
      // search for if we have previously made a search with these params
      // use exact: false to ignore things like sort, pagination etc.
      queryClient.getQueriesData({
        exact: false,
        queryKey: [
          'records',
          { filters: incomingFilters, searchParams: searchParams },
        ],
      }).length > 0
    ) {
      setDisplayingWarningMessage(false);
      dispatch(changeAppliedFilters(newFilters));
      onClose();
    }
  }, [
    dispatch,
    displayingWarningMessage,
    onClose,
    queryClient,
    searchParams,
    newFilters,
  ]);

  // this should run after applyFilters is called and incomingCount
  // is subsequently updated - here we check if we're over the record limit and either
  // display the warning message or update the applied filters
  React.useEffect(() => {
    // check incomingCount isn't undefined so we don't run on initial render
    // also make sure the dialogue is open to not run in the background
    if (typeof incomingCount !== 'undefined' && open) {
      if (
        !displayingWarningMessage &&
        overRecordLimit() &&
        // search for if we have previously made a search with these params
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
      } else {
        setDisplayingWarningMessage(false);
        dispatch(changeAppliedFilters(newFilters));
        onClose();
      }
    }
    // deliberately only want this use effect to be called when incomingCount or incomingFilters changes
    // i.e. so we can react to the result of new incoming count queries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCount, incomingFilters]);

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
              grey box when each item has been recognised. Function names are
              not currently supported in filters.
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
