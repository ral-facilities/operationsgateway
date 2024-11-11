import { AddCircle, Delete, Favorite, Warning } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useChannels } from '../api/channels';
import { useFavouriteFilters } from '../api/favouriteFilters';
import { useIncomingRecordCount } from '../api/records';
import { FavouriteFilter, timeChannelName } from '../app.types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectRecordLimitWarning } from '../state/slices/configSlice';
import {
  changeAppliedFilters,
  selectAppliedFilters,
} from '../state/slices/filterSlice';
import { selectSearchParams } from '../state/slices/searchSlice';
import { a11yProps, StyledTab, TabPanel } from '../views/viewTabs.component';
import DeleteFavouriteFilterDialogue from './deleteFavouriteFilterDialogue.component';
import FavouriteFilterDialogue from './favouriteFilterDialogue.component';
import FilterInput from './filterInput.component';
import { parseFilter, Token } from './filterParser';

interface FilterDialogueProps {
  open: boolean;
  onClose: () => void;
  flashingFilterValue?: string;
}

type TabValue = 'Filters' | 'Favourite filters';

const areTokenArraysEqual = (arr1: Token[], arr2: Token[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((token1, index) => {
    const token2 = arr2[index];
    return (
      token1.type === token2.type &&
      token1.value === token2.value &&
      token1.label === token2.label
    );
  });
};

// Function to remove duplicate Token[] arrays from the combined list
const uniqueTokenArrays = (tokenArrays: Token[][]): Token[][] => {
  const uniqueList: Token[][] = [];
  tokenArrays.forEach((tokenArray) => {
    const isDuplicate = uniqueList.some((uniqueArray) =>
      areTokenArraysEqual(uniqueArray, tokenArray)
    );
    if (!isDuplicate) {
      uniqueList.push(tokenArray);
    }
  });
  return uniqueList;
};

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
  <Typography variant="body2" component="div" gutterBottom>
    {props.children}
  </Typography>
);

export const FilterPageHelp = () => {
  const helpPageOperators = [
    '=',
    '!=',
    '>',
    '<',
    '>=',
    '<=',
    'is null',
    'is not null',
    'and',
    'or',
    'not',
    '(',
    ')',
  ];
  return (
    <Grid item xs>
      <Heading>Filter help</Heading>
      <Body>
        In the box, start typing data channel names, numbers, mathematical
        symbols such as{' '}
        <Chip
          label=">"
          size="small"
          sx={{
            fontSize: '0.8125rem',
            mx: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />{' '}
        and{' '}
        <Chip
          label="<="
          size="small"
          sx={{
            fontSize: '0.8125rem',
            mx: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />{' '}
        and keywords such as{' '}
        <Chip
          label="AND"
          size="small"
          sx={{
            fontSize: '0.8125rem',
            mx: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />
        ,{' '}
        <Chip
          label="OR"
          size="small"
          sx={{
            fontSize: '0.8125rem',
            mr: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />{' '}
        and{' '}
        <Chip
          label="NOT"
          size="small"
          sx={{
            fontSize: '0.8125rem',
            ml: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />
        . The Wizard will suggest suitable options and indicate using a grey box
        when each item has been recognised. Function names are not currently
        supported in filters.
      </Body>
      <Heading>Operators included</Heading>
      <Body>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {helpPageOperators.map((operator, _index) => (
            <React.Fragment key={operator}>
              <Chip
                label={operator}
                size="small"
                sx={{
                  fontSize: '0.8125rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                }}
              />
            </React.Fragment>
          ))}
        </Box>
      </Body>
    </Grid>
  );
};

const FilterDialogue = (props: FilterDialogueProps) => {
  const { open, onClose, flashingFilterValue } = props;
  const dispatch = useAppDispatch();
  const appliedFilters = useAppSelector(selectAppliedFilters);
  // we need searchParams so we can check for past queries before showing the warning message
  const searchParams = useAppSelector(selectSearchParams);
  const [filters, setFilters] = React.useState<Token[][]>(appliedFilters);
  const [errors, setErrors] = React.useState<(string | undefined)[]>(
    appliedFilters.map(() => undefined)
  );
  const [favouriteFiltersType, setFavouriteFiltersType] = React.useState<
    false | 'post' | 'patch'
  >(false);

  const [openDeleteDialogue, setOpenDeleteDialogue] =
    React.useState<boolean>(false);
  const [selectedFavouriteFilter, setSelectedFavouriteFilter] = React.useState<
    FavouriteFilter | undefined
  >(undefined);

  const [selectedFavouriteFilterIds, setSelectedFavouriteFilterIds] =
    React.useState<string[]>([]);

  const { data: favouriteFilterData } = useFavouriteFilters();

  // Function to handle checkbox changes
  const handleCheckboxChange = (data: FavouriteFilter, checked: boolean) => {
    if (checked) {
      setSelectedFavouriteFilterIds((prev) => [...prev, data._id]);
    } else {
      setSelectedFavouriteFilterIds((prev) =>
        prev.filter((id) => id !== data._id)
      );
    }
  };

  const [tabValue, setTabValue] = React.useState<TabValue>('Filters');

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TabValue
  ) => {
    setTabValue(newValue);
  };
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

  const tokenisedFavouriteFilters: Token[] | undefined = favouriteFilterData
    ? favouriteFilterData?.map((filter) => ({
        type: 'favouriteFilter',
        value: filter.filter,
        label: filter.name,
      }))
    : [];

  const handleClose = React.useCallback(() => {
    onClose();
    setTabValue('Filters');
    setSelectedFavouriteFilterIds([]);
  }, [onClose]);

  React.useEffect(() => {
    setFilters(appliedFilters);
    setErrors(appliedFilters.map(() => undefined));
  }, [appliedFilters]);

  const handleChangeValue = React.useCallback(
    (index: number) => (value: Token[]) => {
      const parsedValue = value.flatMap((token) => {
        if (token.type === 'favouriteFilter') {
          return JSON.parse(token.value) as Token[]; // Parse the value as Token[]
        }
        return token; // Keep other tokens unchanged
      });

      return setFilters((filters) => {
        return [
          ...filters.slice(0, index),
          parsedValue,
          ...filters.slice(index + 1),
        ];
      });
    },
    []
  );
  const handleChangeError = React.useCallback(
    (index: number) => (value?: string) =>
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

  const selectedFavouriteFilters: FavouriteFilter[] = selectedFavouriteFilterIds
    .map((id) => favouriteFilterData?.find((filter) => filter._id === id))
    .filter((filter): filter is FavouriteFilter => filter !== undefined);

  const uniqueCombinedFiltersList = uniqueTokenArrays([
    ...filters,
    ...(selectedFavouriteFilters.map((filter) =>
      JSON.parse(filter.filter)
    ) as Token[][]),
  ]);

  let newFilters = uniqueCombinedFiltersList.filter((f) => f.length > 0);
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
      handleClose();
    }
  }, [
    newFilters,
    displayingWarningMessage,
    queryClient,
    searchParams,
    dispatch,
    handleClose,
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
        handleClose();
      }
    }
    // deliberately only want this use effect to be called when incomingCount or incomingFilters changes
    // i.e. so we can react to the result of new incoming count queries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCount, incomingFilters]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      PaperProps={{ 'aria-label': 'Filters' }}
      fullWidth
    >
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="view tabs">
        <StyledTab
          value="Filters"
          label="Filters"
          {...a11yProps<TabValue>('Filters')}
        />
        <StyledTab
          value="Favourite filters"
          label={
            <Box display="flex" alignItems="center">
              Favourite filters
              <Chip
                label={selectedFavouriteFilters.length}
                size="small"
                color="primary"
                sx={{ ml: 1 }} // Adds a margin between the text and chip
              />
            </Box>
          }
          {...a11yProps<TabValue>('Favourite filters')}
        />
      </Tabs>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid item container xs={12}>
            <TabPanel<TabValue>
              value={tabValue}
              label={'Filters'}
              style={{ width: '100%' }}
            >
              <Grid item container xs>
                <Grid
                  container
                  item
                  xs={12}
                  sm={6}
                  pr={1}
                  flexDirection="column"
                  rowSpacing={1}
                >
                  <Heading mt={1}>Enter filter</Heading>
                  {filters.map((filter, index) => (
                    <Grid container item key={index}>
                      <Grid item xs>
                        <FilterInput
                          channels={channels ?? []}
                          favouriteFilter={tokenisedFavouriteFilters ?? []}
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
                      <Grid item xs={0.6} mt={0.5}>
                        <IconButton
                          onClick={() => {
                            setFavouriteFiltersType('post');
                            setSelectedFavouriteFilter({
                              _id: '',
                              name: '',
                              filter: JSON.stringify(filter),
                            });
                          }}
                          size="small"
                          aria-label={`Add as favourite filter`}
                        >
                          <Favorite />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}

                  <Grid item>
                    <Button
                      onClick={() => {
                        setFilters((filters) => [...filters, []]);
                        setErrors((errors) => [...errors, undefined]);
                      }}
                      variant="outlined"
                      size="small"
                      startIcon={<AddCircle />}
                    >
                      Add new filter
                    </Button>
                  </Grid>
                </Grid>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <FilterPageHelp />
              </Grid>
            </TabPanel>

            <TabPanel<TabValue>
              value={tabValue}
              label={'Favourite filters'}
              style={{ width: '100%' }}
            >
              <Grid item xs>
                <Button
                  onClick={() => {
                    setSelectedFavouriteFilter(undefined);
                    setFavouriteFiltersType('post');
                  }}
                  variant="outlined"
                  size="small"
                  startIcon={<AddCircle />}
                >
                  Add new favourite filter
                </Button>
              </Grid>
              <Grid item container flexDirection="column" mt={1} rowSpacing={1}>
                {favouriteFilterData?.map((data) => {
                  const isChecked = selectedFavouriteFilters.some(
                    (filter) => filter._id === data._id
                  );

                  return (
                    <Grid item container spacing={1} key={data._id}>
                      <Grid item xs={0.5}>
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxChange(data, e.target.checked)
                          }
                          inputProps={{
                            'aria-label': `Select ${data.name} favourite filter`,
                          }}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          inputProps={{
                            readOnly: true,
                            disabled: true,
                          }}
                          sx={{
                            // change label and border color when readonly
                            '&:has([readonly]) ': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#cecece',
                              },
                            },
                          }}
                          label="Name"
                          value={data.name}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <FilterInput
                          channels={channels ?? []}
                          favouriteFilter={tokenisedFavouriteFilters ?? []}
                          value={JSON.parse(data.filter) as Token[]}
                          setValue={() => {}}
                          setError={() => {}}
                          readOnly
                        />
                      </Grid>
                      <Grid item xs={0.5}>
                        <Tooltip title={`Edit ${data.name}`}>
                          <IconButton
                            onClick={() => {
                              setSelectedFavouriteFilter(data);
                              setFavouriteFiltersType('patch');
                            }}
                            aria-label={`Edit ${data.name} favourite filter`}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={0.5}>
                        <Tooltip title={`Delete ${data.name}`}>
                          <IconButton
                            onClick={() => {
                              setSelectedFavouriteFilter(data);
                              setOpenDeleteDialogue(true);
                            }}
                            aria-label={`Delete ${data.name} favourite filter`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>

              <DeleteFavouriteFilterDialogue
                open={openDeleteDialogue}
                onClose={() => {
                  setOpenDeleteDialogue(false);
                  setSelectedFavouriteFilter(undefined);
                }}
                favouriteFilter={selectedFavouriteFilter}
              />
            </TabPanel>
            <FavouriteFilterDialogue
              open={!!favouriteFiltersType}
              requestType={
                favouriteFiltersType === false ? 'post' : favouriteFiltersType
              }
              selectedFavouriteFilter={selectedFavouriteFilter}
              onClose={() => {
                setFavouriteFiltersType(false);
              }}
              channels={channels ?? []}
              tokenisedFavouriteFilters={tokenisedFavouriteFilters}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
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
              disabled={errors.some((e) => e !== undefined)}
              onClick={() => applyFilters()}
            >
              Apply
            </Button>
          </Tooltip>
        ) : (
          <Button
            disabled={errors.some((e) => e !== undefined)}
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
