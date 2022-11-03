import { Stack } from '@mui/material';
import React from 'react';
import SearchBar from '../search/searchBar.component';
import ColumnCheckboxes from '../table/columnCheckboxes.component';
import RecordTable from './recordTable.component';
import TableButtons from './tableButtons.component';

const DataView = React.memo((): React.ReactElement => {
  return (
    <Stack spacing={1} ml={1} mr={1} mt={1}>
      <SearchBar />
      <TableButtons />
      <RecordTable />
      <ColumnCheckboxes />
    </Stack>
  );
});

export default DataView;
