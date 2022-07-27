import React from 'react';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import Table from '../table/table.component';
import { Order, RecordRow } from '../app.types';
import { Column } from 'react-table';
import DateTimeInputBox from './dateTimeInput.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  changeSort,
  changePage,
  changeResultsPerPage,
} from '../state/slices/columnsSlice';
import ColumnCheckboxes from '../table/columnCheckboxes.component';
import { selectQueryParams } from '../state/slices/searchSlice';
import { useChannels } from '../api/channels';
import { roundNumber } from '../table/cellRenderers/cellContentRenderers';

const RecordTable = React.memo((): React.ReactElement => {
  const dispatch = useAppDispatch();

  const queryParams = useAppSelector(selectQueryParams);
  const { sort, page, resultsPerPage } = queryParams;

  const { data, isLoading: dataLoading } = useRecordsPaginated();
  const { data: count, isLoading: countLoading } = useRecordCount();

  const { data: channels, isLoading: channelsLoading } = useChannels();

  // Use this as the controlling variable for data having loaded
  // As there is a disconnect between data loaded from the backend and time before it is processed and ready for display, we use this to keep track of available data instead
  const [columnsLoaded, setColumnsLoaded] = React.useState<boolean>(false);
  const [availableColumns, setAvailableColumns] = React.useState<Column[]>([]);

  const constructColumns = React.useCallback(
    (parsed: RecordRow[]): Column[] => {
      let myColumns: Column[] = [];
      let accessors: Set<string> = new Set<string>();

      parsed.forEach((recordRow: RecordRow) => {
        const keys = Object.keys(recordRow);

        for (let i = 0; i < keys.length; i++) {
          if (!accessors.has(keys[i])) {
            const channelInfo = channels?.find(
              (channel) => channel.systemName === keys[i]
            );
            const newColumn: Column = {
              Header: () => {
                const headerName = channelInfo
                  ? channelInfo.userFriendlyName
                    ? channelInfo.userFriendlyName
                    : channelInfo.systemName
                  : keys[i];
                // Provide an actual header here when we have it
                // TODO: do we need to split on things other than underscore?
                const parts = headerName.split('_');
                const wordWrap = parts.map(
                  (part, i) =>
                    // \u200B renders a zero-width space character
                    // which allows line-break but isn't visible
                    part + (i < parts.length - 1 ? '_\u200B' : '')
                );
                return <React.Fragment>{wordWrap.join('')}</React.Fragment>;
              },
              accessor: keys[i],
              // TODO: get these from data channel info
              channelInfo: channelInfo,
            };
            if (channelInfo?.dataType === 'scalar') {
              newColumn.Cell = ({ value }) =>
                typeof value === 'number' &&
                typeof channelInfo.significantFigures === 'number' ? (
                  <React.Fragment>
                    {roundNumber(
                      value,
                      channelInfo.significantFigures,
                      channelInfo.scientificNotation ?? false
                    )}
                  </React.Fragment>
                ) : (
                  <React.Fragment>{String(value ?? '')}</React.Fragment>
                );
            }
            myColumns.push(newColumn);
            accessors.add(keys[i]);
          }
        }
      });

      return myColumns;
    },
    [channels]
  );

  React.useEffect(() => {
    if (data && !channelsLoading && !columnsLoaded) {
      // columns normally don't reload each time the data changes
      const newAvailableColumns = constructColumns(data);
      setAvailableColumns(newAvailableColumns);
      setColumnsLoaded(true);
    }
  }, [data, channelsLoading, columnsLoaded, dispatch, constructColumns]);

  const onPageChange = React.useCallback(
    (page: number) => {
      dispatch(changePage(page));
    },
    [dispatch]
  );

  const onResultsPerPageChange = React.useCallback(
    (resultsPerPage: number) => {
      dispatch(changeResultsPerPage(resultsPerPage));
    },
    [dispatch]
  );

  const handleSort = React.useCallback(
    (column: string, order: Order | null) => {
      dispatch(changeSort({ column, order }));
    },
    [dispatch]
  );

  // TODO: move the non-Table components out of recordTable and into some sort of
  // page layout container
  return (
    <div>
      <DateTimeInputBox />
      <br />
      <Table
        data={data ?? []}
        availableColumns={availableColumns}
        totalDataCount={count ?? 0}
        page={page}
        loadedData={!dataLoading && columnsLoaded}
        loadedCount={!countLoading}
        resultsPerPage={resultsPerPage}
        onResultsPerPageChange={onResultsPerPageChange}
        onPageChange={onPageChange}
        sort={sort}
        onSort={handleSort}
      />
      <ColumnCheckboxes availableColumns={availableColumns} />
    </div>
  );
});

RecordTable.displayName = 'RecordTable';

export default RecordTable;
