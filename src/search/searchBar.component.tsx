import React from 'react';
import DateTimeSearch from './components/dateTimeSearch.component';
import Timeframe from './components/timeframe.component';

const SearchBar = (): React.ReactElement => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
      }}
    >
      <DateTimeSearch />
      <Timeframe />
    </div>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
