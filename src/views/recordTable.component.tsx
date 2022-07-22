import React from 'react';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import Table from '../table/table.component';
import { Order, RecordRow } from '../app.types';
import { Column } from 'react-table';
import DateTimeInputBox from './dateTimeInput.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  setColumns,
  changeSort,
  changePage,
  changeResultsPerPage,
} from '../state/slices/columnsSlice';
import ColumnCheckboxes from '../table/columnCheckboxes.component';
import { selectQueryParams } from '../state/slices/searchSlice';

const RecordTable = React.memo((): React.ReactElement => {
  const dispatch = useAppDispatch();

  const queryParams = useAppSelector(selectQueryParams);
  const { sort, page, resultsPerPage } = queryParams;

  const { data, isLoading: dataLoading } = useRecordsPaginated();
  const { data: count, isLoading: countLoading } = useRecordCount();

  // Use this as the controlling variable for data having loaded
  // As there is a disconnect between data loaded from the backend and time before it is processed and ready for display, we use this to keep track of available data instead
  const [columnsLoaded, setColumnsLoaded] = React.useState<boolean>(false);

  const constructColumns = (parsed: RecordRow[]): Column[] => {
    let myColumns: Column[] = [];
    let accessors: Set<string> = new Set<string>();

    parsed.forEach((recordRow: RecordRow) => {
      const keys = Object.keys(recordRow);

      for (let i = 0; i < keys.length; i++) {
        if (!accessors.has(keys[i])) {
          const newColumn: Column = {
            Header: keys[i], // Provide an actual header here when we have it
            accessor: keys[i],
            // TODO: get these from data channel info
            channelInfo: {
              units: `${keys[i]} units`,
              description: `${keys[i]} description`,
            },
          };
          myColumns.push(newColumn);
          accessors.add(keys[i]);
        }
      }
    });

    return myColumns;
  };

  React.useEffect(() => {
    if (data && !columnsLoaded) {
      // columns normally don't reload each time the data changes
      const newAvailableColumns = constructColumns(data);
      dispatch(setColumns(newAvailableColumns));
      setColumnsLoaded(true);
    }
  }, [data, columnsLoaded, dispatch]);

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
      <ColumnCheckboxes />
    </div>
  );
});

RecordTable.displayName = 'RecordTable';

export default RecordTable;
