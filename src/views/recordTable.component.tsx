import React from 'react';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import Table from '../table/table.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  changeSort,
  changePage,
  changeResultsPerPage,
  selectColumnStates,
  selectHiddenChannels,
  selectSelectedIds,
  deselectColumn,
  reorderColumn,
  selectColumn,
  toggleWordWrap,
} from '../state/slices/tableSlice';
import { selectQueryParams } from '../state/slices/searchSlice';
import { useAvailableColumns, useChannels } from '../api/channels';
import { DropResult } from 'react-beautiful-dnd';
import { Order } from '../app.types';

const RecordTable = React.memo((): React.ReactElement => {
  const dispatch = useAppDispatch();

  const queryParams = useAppSelector(selectQueryParams);
  const { sort, page, resultsPerPage } = queryParams;

  const { data, isLoading: dataLoading } = useRecordsPaginated();
  const { data: count, isLoading: countLoading } = useRecordCount();
  const { data: availableColumns, isLoading: columnsLoading } =
    useAvailableColumns();

  const columnStates = useAppSelector(selectColumnStates);

  const { data: allChannels } = useChannels(); // just for use with hiddenColumns, not passed anywhere else
  const hiddenColumns = useAppSelector((state) =>
    selectHiddenChannels(state, allChannels ?? [])
  );

  const columnOrder = useAppSelector(selectSelectedIds);

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

  const handleColumnWordWrapToggle = React.useCallback(
    (column: string): void => {
      dispatch(toggleWordWrap(column));
    },
    [dispatch]
  );

  const handleOnDragEnd = React.useCallback(
    (result: DropResult): void => {
      dispatch(reorderColumn(result));
    },
    [dispatch]
  );

  const handleColumnClose = React.useCallback(
    (column: string): void => {
      dispatch(deselectColumn(column));
    },
    [dispatch]
  );

  // Ensure the timestamp column is opened automatically on table load
  React.useEffect(() => {
    if (!dataLoading && !columnOrder.includes('timestamp')) {
      dispatch(selectColumn('timestamp'));
    }
  }, [dataLoading, columnOrder, dispatch]);

  return (
    <Table
      data={data ?? []}
      availableColumns={availableColumns ?? []}
      columnStates={columnStates}
      hiddenColumns={hiddenColumns}
      columnOrder={columnOrder}
      totalDataCount={count ?? 0}
      page={page}
      loadedData={!dataLoading && !columnsLoading}
      loadedCount={!countLoading}
      resultsPerPage={resultsPerPage}
      onResultsPerPageChange={onResultsPerPageChange}
      onPageChange={onPageChange}
      sort={sort}
      onSort={handleSort}
      onColumnWordWrapToggle={handleColumnWordWrapToggle}
      onDragEnd={handleOnDragEnd}
      onColumnClose={handleColumnClose}
    />
  );
});

RecordTable.displayName = 'RecordTable';

export default RecordTable;
