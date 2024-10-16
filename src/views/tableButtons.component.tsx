import { Button, ButtonGroup } from '@mui/material';

interface TableButtonProps {
  openFilters: () => void;
  openFunctions: () => void;
  openChannels: () => void;
  searchExpanded: boolean;
  toggleSearchExpanded: () => void;
}

const TableButtons = (props: TableButtonProps) => {
  const {
    openFilters,
    openChannels,
    openFunctions,
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
