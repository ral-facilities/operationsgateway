import { Stack } from '@mui/material';
import React from 'react';
import ChannelsDialogue from '../channels/channelsDialogue.component';
import FilterDialogue from '../filtering/filterDialogue.component';
import SearchBar from '../search/searchBar.component';
import RecordTable from './recordTable.component';
import TableButtons from './tableButtons.component';
export interface DataViewProps {
  sessionId: string | undefined;
}
const DataView = React.memo((props: DataViewProps): React.ReactElement => {
  const { sessionId } = props;
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const [channelsOpen, setChannelsOpen] = React.useState<boolean>(false);
  const [flashingFilterValue, setFlashingFilterValue] = React.useState<
    string | undefined
  >(undefined);

  const [searchExpanded, setSearchExpanded] = React.useState<boolean>(true);

  const openFiltersFromDataHeader = React.useCallback((headerName: string) => {
    setFiltersOpen(true);
    setFlashingFilterValue(headerName);
  }, []);

  const [searchHeight, setSearchHeight] = React.useState(0);

  const searchResizeObserver = React.useRef<ResizeObserver>(
    new ResizeObserver((entries) => {
      if (entries[0].contentRect.height)
        setSearchHeight(entries[0].contentRect.height);
    })
  );

  // need to use a useCallback instead of a useRef for this
  // see https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const searchHeightRef = React.useCallback((container: HTMLDivElement) => {
    if (container !== null) {
      searchResizeObserver.current.observe(container);
    }
    // When element is unmounted we know container is null so time to clean up
    else {
      if (searchResizeObserver.current)
        searchResizeObserver.current.disconnect();
    }
  }, []);

  // SG header + SG footer + tabs + search + spacing + buttons + spacing + pagination
  const tableHeight = `calc(100vh - (64px + 32px + 49px ${
    searchExpanded ? `+ ${searchHeight}px` : ''
  } + 8px + 32px + 8px + 52px))`;

  return (
    <Stack spacing={1} ml={1} mr={1} mt={1}>
      <SearchBar
        expanded={searchExpanded}
        sessionId={sessionId}
        heightRef={searchHeightRef}
      />
      <TableButtons
        searchExpanded={searchExpanded}
        toggleSearchExpanded={() =>
          setSearchExpanded((searchExpanded) => !searchExpanded)
        }
        openFilters={() => setFiltersOpen(true)}
        openChannels={() => setChannelsOpen(true)}
      />
      <FilterDialogue
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        flashingFilterValue={flashingFilterValue}
      />
      <ChannelsDialogue
        open={channelsOpen}
        onClose={() => setChannelsOpen(false)}
      />
      <RecordTable
        openFilters={openFiltersFromDataHeader}
        tableHeight={tableHeight}
      />
    </Stack>
  );
});

export default DataView;
