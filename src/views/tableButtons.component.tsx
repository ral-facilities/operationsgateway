import { Button, ButtonGroup } from '@mui/material';
import React from 'react';

interface TableButtonProps {
  openFunctions: () => void;
  openFilters: () => void;
  openChannels: () => void;
  searchExpanded: boolean;
  toggleSearchExpanded: () => void;
}

const TableButtons = (props: TableButtonProps) => {
  const {
    openFunctions,
    openFilters,
    openChannels,
    searchExpanded,
    toggleSearchExpanded,
  } = props;

  return (
    <ButtonGroup size="small">
      <Button onClick={toggleSearchExpanded}>
        {searchExpanded ? 'Hide search' : 'Show search'}
      </Button>
      <Button onClick={openChannels}>Data Channels</Button>
      <Button onClick={openFilters}>Filters</Button>
      <Button onClick={openFunctions}>Functions</Button>
    </ButtonGroup>
  );
};

export default TableButtons;
