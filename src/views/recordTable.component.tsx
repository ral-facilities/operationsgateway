import React from 'react';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import Table from '../table/table.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  changeSort,
  changePage,
  changeResultsPerPage,
  selectColumnStates,
  selectHiddenColumns,
  selectSelectedIds,
  deselectColumn,
  reorderColumn,
  selectColumn,
  toggleWordWrap,
} from '../state/slices/tableSlice';
import { selectQueryParams } from '../state/slices/searchSlice';
import { selectAppliedFilters } from '../state/slices/filterSlice';
import { useAvailableColumns } from '../api/channels';
import { DropResult } from 'react-beautiful-dnd';
import { Order } from '../app.types';

const RecordTable = React.memo(
  (props: {
    openFilters: (headerName: string) => void;
  }): React.ReactElement => {
    const { openFilters } = props;

    const dispatch = useAppDispatch();

    const [filteredColumns, setFilteredColumns] = React.useState<string[]>([]);

    const queryParams = useAppSelector(selectQueryParams);
    const { sort, page, resultsPerPage } = queryParams;

    const { data, isLoading: dataLoading } = useRecordsPaginated();
    const { data: count, isLoading: countLoading } = useRecordCount();
    const { data: availableColumns, isLoading: columnsLoading } =
      useAvailableColumns();

    const columnStates = useAppSelector(selectColumnStates);
    const hiddenColumns = useAppSelector((state) =>
      selectHiddenColumns(state, availableColumns ?? [])
    );

    const columnOrder = useAppSelector(selectSelectedIds);
    const appliedFilters = useAppSelector(selectAppliedFilters);

    // Update the list of filtered channels
    React.useEffect(() => {
      let newFilteredColumns: string[] = [];

      appliedFilters.forEach((f) => {
        // Extract the channel names from the token array
        const channelNames = f
          .filter((f) => f.type === 'channel')
          .map((f) => f.value);
        newFilteredColumns = [...newFilteredColumns, ...channelNames];
      });

      // Remove duplicates
      newFilteredColumns = newFilteredColumns.filter(
        (f, i) => newFilteredColumns.indexOf(f) === i
      );

      setFilteredColumns(newFilteredColumns);
    }, [appliedFilters]);

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
        filteredColumns={filteredColumns}
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
        openFilters={openFilters}
      />
    );
  }
);

RecordTable.displayName = 'RecordTable';

export default RecordTable;
