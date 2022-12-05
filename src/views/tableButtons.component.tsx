import { Button, ButtonGroup } from '@mui/material';
import React from 'react';

interface TableButtonProps {
  openFilters: () => void;
  searchExpanded: boolean;
  toggleSearchExpanded: () => void;
}

const TableButtons = (props: TableButtonProps) => {
  const { openFilters, searchExpanded, toggleSearchExpanded } = props;

  return (
    <ButtonGroup size="small">
      <Button onClick={toggleSearchExpanded}>
        {searchExpanded ? 'Hide search' : 'Show search'}
      </Button>
      <Button>Data Channels</Button>
      <Button onClick={openFilters}>Filters</Button>
      <Button>Functions</Button>
    </ButtonGroup>
  );
};

export default TableButtons;
