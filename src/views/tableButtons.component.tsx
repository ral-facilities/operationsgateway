import { Button, ButtonGroup } from '@mui/material';
import React from 'react';
import FilterDialogue from '../filtering/filterDialogue.component';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TableButtonsProps {}

const TableButtons = (props: TableButtonsProps) => {
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
