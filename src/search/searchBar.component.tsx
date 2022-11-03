import React from 'react';
import { Box } from '@mui/material';
import DateTimeInputBox from './components/dateTimeInput.component';

const SearchBar = (): React.ReactElement => {
  return (
    <Box>
      <DateTimeInputBox />
    </Box>
  );
};

export default SearchBar;
