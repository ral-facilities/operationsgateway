import { Stack } from '@mui/material';
import React from 'react';
import SearchBar from '../search/searchBar.component';
import FilterDialogue from '../filtering/filterDialogue.component';
import RecordTable from './recordTable.component';
import TableButtons from './tableButtons.component';
import ChannelsDialogue from '../channels/channelsDialogue.component';
import FunctionsDialogue from '../functions/functionsDialogue.component';
export interface DataViewProps {
  sessionId: string | undefined;
}
const DataView = React.memo((props: DataViewProps): React.ReactElement => {
  const { sessionId } = props;
  const [functionsOpen, setFunctionsOpen] = React.useState<boolean>(false);
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

  // SG header + SG footer + tabs + spacing + search + spacing + buttons + spacing + pagination
  const tableHeight = `calc(100vh - (64px + 36px + 50px + 8px ${
    searchExpanded ? '+ 96px + 8px' : ''
  } + 32px + 8px + 52px))`;

  return (
    <Stack spacing={1} ml={1} mr={1} mt={1}>
      <SearchBar expanded={searchExpanded} sessionId={sessionId} />
      <TableButtons
        searchExpanded={searchExpanded}
        toggleSearchExpanded={() =>
          setSearchExpanded((searchExpanded) => !searchExpanded)
        }
        openFunctions={() => setFunctionsOpen(true)}
        openFilters={() => setFiltersOpen(true)}
        openChannels={() => setChannelsOpen(true)}
      />
      <FunctionsDialogue
        open={functionsOpen}
        onClose={() => setFunctionsOpen(false)}
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
