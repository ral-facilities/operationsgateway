import React from 'react';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import Table from '../table/table.component';
import { TextField, Button } from '@mui/material';
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
  updateSelectedColumns,
  updateColumnStates,
} from '../state/slices/tableSlice';
import {
  changeSearchParams,
  selectQueryParams,
} from '../state/slices/searchSlice';
import {
  changeAppliedFilters,
  selectAppliedFilters,
} from '../state/slices/filterSlice';
import { useAvailableColumns } from '../api/channels';
import { DropResult } from 'react-beautiful-dnd';
import { Order, timeChannelName } from '../app.types';
import type { Token } from '../filtering/filterParser';
import { selectPlots } from '../state/slices/plotSlice';
import {
  TraceOrImageWindow,
  openImageWindow,
  openTraceWindow,
  selectImageWindows,
  selectTraceWindows,
} from '../state/slices/windowSlice';

export const extractChannelsFromTokens = (
  appliedFilters: Token[][]
): string[] => {
  let allChannelNames: string[] = [];

  appliedFilters.forEach((f) => {
    // Extract the channel names from the token array
    const channelNames = f
      .filter((f) => f.type === 'channel')
      .map((f) => f.value);
    allChannelNames = [...allChannelNames, ...channelNames];
  });

  // Remove duplicates
  allChannelNames = allChannelNames.filter(
    (f, i) => allChannelNames.indexOf(f) === i
  );
  return allChannelNames;
};

const RecordTable = React.memo(
  (props: {
    openFilters: (headerName: string) => void;
    tableHeight: string;
  }): React.ReactElement => {
    const { openFilters, tableHeight } = props;

    const dispatch = useAppDispatch();

    const appliedFilters = useAppSelector(selectAppliedFilters);
    const queryParams = useAppSelector(selectQueryParams);
    const { sort, page, resultsPerPage, searchParams } = queryParams;
    const { maxShots } = searchParams;
    const plots = useAppSelector(selectPlots);
    const { data, isLoading: dataLoading } = useRecordsPaginated();
    const { data: count, isLoading: countLoading } = useRecordCount();
    const { data: availableColumns, isLoading: columnsLoading } =
      useAvailableColumns();

    const columnStates = useAppSelector(selectColumnStates);
    const hiddenColumns = useAppSelector((state) =>
      selectHiddenColumns(state, availableColumns ?? [])
    );

    const windowTrace = useAppSelector(selectTraceWindows);

    const windowImage = useAppSelector(selectImageWindows);

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

    const filteredChannelNames = React.useMemo(() => {
      return extractChannelsFromTokens(appliedFilters);
    }, [appliedFilters]);

    // Ensure the timestamp column is opened automatically on table load
    React.useEffect(() => {
      if (!dataLoading && !columnOrder.includes(timeChannelName)) {
        dispatch(selectColumn(timeChannelName));
      }
    }, [dataLoading, columnOrder, dispatch]);

    const [savedSession, setSavedSession] = React.useState<string | undefined>(
      undefined
    );

    // console.log(savedSession);

    const handleExport = React.useCallback(() => {
      const sortArray: { column: string; order: Order }[] = Object.entries(
        sort as {
          [column: string]: Order;
        }
      ).map(([column, order]) => ({
        column,
        order,
      }));

      const windowTraceArray: { recordId: string; channelName: string }[] = (
        windowTrace as TraceOrImageWindow[]
      ).map(({ recordId, channelName }) => ({ recordId, channelName }));

      const windowImageArray: { recordId: string; channelName: string }[] = (
        windowImage as TraceOrImageWindow[]
      ).map(({ recordId, channelName }) => ({ recordId, channelName }));

      const session = {
        sortArray,
        page,
        resultsPerPage,
        searchParams,
        columnOrder,
        columnStates,
        appliedFilters,
        plots,
        windowTraceArray,
        windowImageArray,
      };
      setSavedSession(JSON.stringify(session));
    }, [
      sort,
      page,
      resultsPerPage,
      searchParams,
      columnOrder,
      columnStates,
      appliedFilters,
      plots,
      windowTrace,
      windowImage,
    ]);

    const handleImport = React.useCallback(() => {
      if (savedSession) {
        const {
          sortArray,
          page,
          resultsPerPage,
          searchParams,
          columnOrder,
          columnStates,
          appliedFilters,
          plots,
          windowTraceArray,
          windowImageArray,
        } = JSON.parse(savedSession);
        dispatch(changeSearchParams(searchParams));
        dispatch(changeAppliedFilters(appliedFilters));
        dispatch(updateSelectedColumns(columnOrder));
        dispatch(updateColumnStates(columnStates));

        sortArray.forEach((sort: { column: string; order: Order }) => {
          dispatch(changeSort(sort));
        });
        windowImageArray.forEach(
          (windowImage: { recordId: string; channelName: string }) => {
            dispatch(openImageWindow(windowImage));
            console.log('Image');
          }
        );
        windowTraceArray.forEach(
          (windowTrace: { recordId: string; channelName: string }) => {
            dispatch(openTraceWindow(windowTrace));
            console.log('Trace');
          }
        );
        console.log(page);
        console.log(resultsPerPage);
        console.log(plots);
      }
    }, [savedSession, dispatch]);

    return (
      <div>
        <Table
          tableHeight={tableHeight}
          data={data ?? []}
          availableColumns={availableColumns ?? []}
          columnStates={columnStates}
          hiddenColumns={hiddenColumns}
          columnOrder={columnOrder}
          totalDataCount={count ?? 0}
          maxShots={maxShots}
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
          filteredChannelNames={filteredChannelNames}
        />
        <Button onClick={handleExport}> Export </Button>
        <TextField
          sx={{ width: '100%' }}
          value={savedSession}
          onChange={(event) => {
            setSavedSession(
              event.target.value ? event.target.value : undefined
            );
          }}
        />
        <Button onClick={handleImport}> Import </Button>
      </div>
    );
  }
);

RecordTable.displayName = 'RecordTable';

export default RecordTable;
