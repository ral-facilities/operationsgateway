import React from 'react';
import { Order, RecordRow, columnIconMappings } from '../app.types';
import {
  useTable,
  useFlexLayout,
  useResizeColumns,
  useColumnOrder,
  ColumnInstance,
  usePagination,
} from 'react-table';
import {
  TableContainer as MuiTableContainer,
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TablePagination as MuiTablePagination,
  Paper,
  SxProps,
  Theme,
} from '@mui/material';
import DataHeader from './headerRenderers/dataHeader.component';
import DataCell from './cellRenderers/dataCell.component';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import {
  deselectColumn,
  reorderColumn,
  selectAvailableColumns,
  selectColumn,
  selectHiddenColumns,
} from '../state/slices/columnsSlice';

// 24 - the width of the close icon in header
// 4.8 - the width of the divider
const additionalHeaderSpace = 24 + 4.8;

// 31.2 - the height of a column header with the close icon included
const headerHeight = 31.2;

const stickyColumnStyles: SxProps<Theme> = {
  position: 'sticky',
  left: 0,
  backgroundColor: (theme) => theme.palette.background.default,
  zIndex: 2,
};

export interface TableProps {
  data: RecordRow[];
  totalDataCount: number;
  page: number;
  loadedData: boolean;
  loadedCount: boolean;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange: (resultsPerPage: number) => void;
  sort: { [column: string]: Order };
  onSort: (column: string, order: Order | null) => void;
}

const Table = React.memo((props: TableProps): React.ReactElement => {
  const {
    data,
    totalDataCount,
    loadedData,
    loadedCount,
    page,
    resultsPerPage,
    onPageChange,
    onResultsPerPageChange,
    sort,
    onSort,
  } = props;

  /*
   ** A note about the columns used in this file:
   ** availableColumns - this represent all columns that can currently be added to the
   **                    display based on data received from the backend
   ** hiddenColumns   -  these are the columns the user has *not* selected to appear in the table
   **                    These are used to tell react-table which columns to show
   ** visibleColumns   - these are the columns that React Table says are currently in the
   **                    display. It contains all information about the displayed columns,
   **                    including column width, columnResizing boolean, etc. selectedColumns
   **                    does NOT contain this info and is defined by the user, not React Table
   */

  const availableColumns = useAppSelector(selectAvailableColumns);
  const hiddenColumns = useAppSelector(selectHiddenColumns);
  const columnOrder = useAppSelector(
    (state) => state.columns.selectedColumnIds
  );
  const dispatch = useAppDispatch();

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150 + additionalHeaderSpace,
    }),
    []
  );

  const [maxPage, setMaxPage] = React.useState(0);

  React.useEffect(() => {
    if (loadedCount) {
      const newMaxPage = ~~(1 + (totalDataCount - 1) / resultsPerPage);
      if (newMaxPage !== maxPage) {
        setMaxPage(newMaxPage);
      } else if (maxPage > -1 && page > newMaxPage) {
        onPageChange(0);
      }
    }
  }, [
    loadedCount,
    maxPage,
    onPageChange,
    page,
    resultsPerPage,
    totalDataCount,
  ]);

  const tableInstance = useTable(
    {
      columns: availableColumns,
      data,
      defaultColumn,
      initialState: {
        columnOrder,
        hiddenColumns,
        pageIndex: page,
        pageSize: resultsPerPage,
      },
      pageCount: maxPage,
      manualPagination: true,
      useControlledState: (state) => {
        return React.useMemo(
          () => ({
            ...state,
            columnOrder: columnOrder,
            hiddenColumns: hiddenColumns,
            pageIndex: page,
            pageSize: resultsPerPage,
          }),
          // eslint complains that we don't need these deps when we really do
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [state, columnOrder, hiddenColumns, page, resultsPerPage]
        );
      },
    },
    useResizeColumns,
    useFlexLayout,
    useColumnOrder,
    usePagination
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

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
    if (loadedData && !columnOrder.includes('timestamp'))
      dispatch(selectColumn('timestamp'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedData, columnOrder]);

  return (
    <div>
      {loadedData && totalDataCount > 0 ? (
        <div>
          <div>
            <MuiTableContainer
              role="table-container"
              component={Paper}
              sx={{ maxHeight: 300, overflow: 'auto' }}
            >
              <MuiTable {...getTableProps()}>
                <MuiTableHead
                  sx={{
                    position: 'sticky',
                    backgroundColor: (theme) =>
                      theme.palette.background.default,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {headerGroups.map((headerGroup) => {
                    const { key, ...otherHeaderGroupProps } =
                      headerGroup.getHeaderGroupProps();
                    return (
                      <DragDropContext key={key} onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="columns" direction="horizontal">
                          {(provided) => {
                            return (
                              <MuiTableRow
                                {...otherHeaderGroupProps}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                sx={{
                                  height: headerHeight, // Consistent height to account for headers that don't include any icons
                                }}
                              >
                                {headerGroup.headers.map((column, index) => {
                                  const { key, ...otherHeaderProps } =
                                    column.getHeaderProps();

                                  const dataKey = column.id;
                                  const isTimestampColumn =
                                    dataKey.toUpperCase() === 'TIMESTAMP';
                                  let columnStyles: SxProps<Theme> = {
                                    minWidth: column.minWidth,
                                    width: column.width,
                                    maxWidth: column.maxWidth,
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    paddingRight: '0px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                  };

                                  columnStyles = isTimestampColumn
                                    ? {
                                        ...columnStyles,
                                        ...stickyColumnStyles,
                                      }
                                    : columnStyles;
                                  const { channelInfo } =
                                    column as ColumnInstance;

                                  return (
                                    <DataHeader
                                      key={key}
                                      {...otherHeaderProps}
                                      sx={columnStyles}
                                      resizerProps={column.getResizerProps()}
                                      dataKey={dataKey}
                                      sort={sort}
                                      onSort={onSort}
                                      label={column.render('Header')}
                                      onClose={handleColumnClose}
                                      index={index}
                                      icon={columnIconMappings.get(
                                        column.id.toUpperCase()
                                      )}
                                      channelInfo={channelInfo}
                                    />
                                  );
                                })}
                                {provided.placeholder}
                              </MuiTableRow>
                            );
                          }}
                        </Droppable>
                      </DragDropContext>
                    );
                  })}
                </MuiTableHead>
                <MuiTableBody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    const { key, ...otherRowProps } = row.getRowProps();
                    return (
                      <MuiTableRow key={key} {...otherRowProps}>
                        {row.cells.map((cell) => {
                          const { key, ...otherCellProps } =
                            cell.getCellProps();

                          const dataKey = cell.column.id;
                          const isTimestampColumn =
                            dataKey.toUpperCase() === 'TIMESTAMP';

                          let columnStyles: SxProps<Theme> = {
                            minWidth: cell.column.minWidth,
                            width: cell.column.width,
                            maxWidth: cell.column.maxWidth,
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            paddingRight: '0px',
                            display: 'flex',
                            flexDirection: 'row',
                          };

                          columnStyles = isTimestampColumn
                            ? {
                                ...columnStyles,
                                ...stickyColumnStyles,
                                zIndex: 0,
                              }
                            : columnStyles;

                          return (
                            <DataCell
                              sx={columnStyles}
                              key={key}
                              {...otherCellProps}
                              dataKey={cell.column.id}
                              rowData={cell.render('Cell')}
                            />
                          );
                        })}
                      </MuiTableRow>
                    );
                  })}
                </MuiTableBody>
              </MuiTable>
            </MuiTableContainer>
          </div>
          <MuiTablePagination
            component="div"
            count={totalDataCount}
            onPageChange={(e, page) => onPageChange(page)}
            page={page}
            rowsPerPage={resultsPerPage}
            onRowsPerPageChange={(event) =>
              onResultsPerPageChange(parseInt(event.target.value))
            }
          />
        </div>
      ) : (
        <div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
});

export default Table;
