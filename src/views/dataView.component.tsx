import { Stack } from '@mui/material';
import React from 'react';
import FilterDialogue from '../filtering/filterDialogue.component';
import ColumnCheckboxes from '../table/columnCheckboxes.component';
import DateTimeInputBox from './dateTimeInput.component';
import RecordTable from './recordTable.component';
import TableButtons from './tableButtons.component';

const DataView = React.memo((): React.ReactElement => {
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);

  return (
    <Stack spacing={1} ml={1} mr={1} mt={1}>
      <DateTimeInputBox />
      <TableButtons openFilters={() => setFiltersOpen(true)} />
      <FilterDialogue
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />
      <RecordTable openFilters={() => setFiltersOpen(true)} />
      <ColumnCheckboxes />
    </Stack>
  );
});

export default DataView;
