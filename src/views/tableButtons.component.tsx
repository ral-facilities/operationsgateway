import { Button, ButtonGroup } from '@mui/material';
import React from 'react';
import FilterDialogue from '../filtering/filterDialogue.component';

const TableButtons = () => {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const handleFiltersOpen = React.useCallback(() => {
    setFiltersOpen(true);
  }, [setFiltersOpen]);
  const handleFiltersClose = React.useCallback(() => {
    setFiltersOpen(false);
  }, [setFiltersOpen]);
  return (
    <>
      <ButtonGroup size="small">
        <Button>Data Channels</Button>
        <Button onClick={handleFiltersOpen}>Filters</Button>
        <Button>Functions</Button>
      </ButtonGroup>
      <FilterDialogue open={filtersOpen} onClose={handleFiltersClose} />
    </>
  );
};

export default TableButtons;
