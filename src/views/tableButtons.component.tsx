import { Button, ButtonGroup } from '@mui/material';
import React from 'react';

const TableButtons = (props: { openFilters: () => void }) => {
  const { openFilters } = props;

  return (
    <ButtonGroup size="small">
      <Button>Data Channels</Button>
      <Button onClick={openFilters}>Filters</Button>
      <Button>Functions</Button>
    </ButtonGroup>
  );
};

export default TableButtons;
