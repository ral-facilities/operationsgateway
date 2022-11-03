import React from 'react';
import { Box } from '@mui/material';
import DateTimeSearch from './components/dateTimeSearch.component';

const SearchBar = (): React.ReactElement => {
  return (
    <Box>
      <DateTimeSearch />
    </Box>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
