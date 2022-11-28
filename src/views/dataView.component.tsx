import { Stack } from '@mui/material';
import React from 'react';
import SearchBar from '../search/searchBar.component';
import FilterDialogue from '../filtering/filterDialogue.component';
import ColumnCheckboxes from '../table/columnCheckboxes.component';
import RecordTable from './recordTable.component';
import TableButtons from './tableButtons.component';

const DataView = React.memo((): React.ReactElement => {
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const [flashingFilterValue, setFlashingFilterValue] = React.useState<
    string | undefined
  >(undefined);

  const [searchExpanded, setSearchExpanded] = React.useState<boolean>(true);

  const openFiltersFromDataHeader = React.useCallback((headerName: string) => {
    setFiltersOpen(true);
    setFlashingFilterValue(headerName);
  }, []);

  return (
    <Stack spacing={1} ml={1} mr={1} mt={1}>
      <SearchBar expanded={searchExpanded} />
      <TableButtons
        searchExpanded={searchExpanded}
        toggleSearchExpanded={() =>
          setSearchExpanded((searchExpanded) => !searchExpanded)
        }
        openFilters={() => setFiltersOpen(true)}
      />
      <FilterDialogue
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        flashingFilterValue={flashingFilterValue}
      />
      <RecordTable openFilters={openFiltersFromDataHeader} />
      <ColumnCheckboxes />
    </Stack>
  );
});

export default DataView;
