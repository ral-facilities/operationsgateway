import { Stack } from '@mui/material';
import React from 'react';
import SearchBar from '../search/searchBar.component';
import FilterDialogue from '../filtering/filterDialogue.component';
import RecordTable from './recordTable.component';
import TableButtons from './tableButtons.component';
import ChannelsDialogue from '../channels/channelsDialogue.component';

const DataView = React.memo((): React.ReactElement => {
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const [channelsOpen, setChannelsOpen] = React.useState<boolean>(false);
  const [flashingFilterValue, setFlashingFilterValue] = React.useState<
    string | undefined
  >(undefined);

  const [searchExpanded, setSearchExpanded] = React.useState<boolean>(true);

  const openFiltersFromDataHeader = React.useCallback((headerName: string) => {
    setFiltersOpen(true);
    setFlashingFilterValue(headerName);
  }, []);

  // TODO: add in SG header & footer
  // tabs + spacing + search + spacing + buttons + spacing + pagination
  const tableHeight = `calc(100vh - (50px + 8px ${
    searchExpanded ? '+ 96px + 8px' : ''
  } + 32px + 8px + 52px))`;

  return (
    <Stack spacing={1} ml={1} mr={1} mt={1}>
      <SearchBar expanded={searchExpanded} />
      <TableButtons
        searchExpanded={searchExpanded}
        toggleSearchExpanded={() =>
          setSearchExpanded((searchExpanded) => !searchExpanded)
        }
        openFilters={() => setFiltersOpen(true)}
        openChannels={() => setChannelsOpen(true)}
      />
      <FilterDialogue
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        flashingFilterValue={flashingFilterValue}
      />
      <ChannelsDialogue
        open={channelsOpen}
        onClose={() => setChannelsOpen(false)}
      />
      <RecordTable
        openFilters={openFiltersFromDataHeader}
        tableHeight={tableHeight}
      />
    </Stack>
  );
});

export default DataView;
