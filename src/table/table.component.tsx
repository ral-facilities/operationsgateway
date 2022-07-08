import React from 'react';
import { Order, RecordRow, columnIconMappings } from '../app.types';
import {
  Column,
  useTable,
  useFlexLayout,
  useResizeColumns,
  useColumnOrder,
} from 'react-table';
import {
  TableContainer as MuiTableContainer,
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TablePagination as MuiTablePagination,
  Paper,
} from '@mui/material';
import DataHeader from './headerRenderers/dataHeader.component';
import DataCell from './cellRenderers/dataCell.component';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import ColumnCheckboxes from './columnCheckboxes.component';

// 24 - the width of the close icon in header
// 4.8 - the width of the divider
const additionalHeaderSpace = 24 + 4.8;

export interface TableProps {
  data: RecordRow[];
  availableColumns: Column[];
  totalDataCount: number;
  page: number | null;
  loadedData: boolean;
  loadedCount: boolean;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  sort: { [column: string]: Order };
  onSort: (column: string, order: Order | null) => void;
}

const Table = React.memo((props: TableProps): React.ReactElement => {
  const {
    data,
    availableColumns,
    totalDataCount,
    loadedData,
    loadedCount,
    resultsPerPage,
    onPageChange,
    sort,
    onSort,
  } = props;

  /*
   ** A note about the columns used in this file:
   ** availableColumns - these are the columns passed in from RecordTable.
   **                    They represent all columns that can currently be added to the
   **                    display based on data received from the backend
   ** selectedColumns   - these are the columns the user has selected to appear in the table
   **                    This may include columns not in availableColumns (may have been
   **                    added on another page). This ensures a consistent table display
   ** visibleColumns   - these are the columns that React Table says are currently in the
   **                    display. It contains all information about the displayed columns,
   **                    including column width, columnResizing boolean, etc. selectedColumns
   **                    does NOT contain this info and is defined by the user, not React Table
   */

  const [maxPage, setMaxPage] = React.useState(0);
  const [selectedColumns, setSelectedColumns] = React.useState<Column[]>([]);

  const page = React.useMemo(() => {
    return props.page && props.page > 0 ? props.page : 0;
  }, [props.page]);

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

  const onChecked = (accessor: string, checked: boolean): void => {
    if (checked) {
      const columnToFilter: Column = {
        // Currently this relies on channel columns having the same name for their header and accessor
        // This won't be the case in practice so we'll need to amend this later
        Header: accessor,
        accessor: accessor,
      };
      setSelectedColumns([...selectedColumns, columnToFilter]);
    } else {
      setSelectedColumns(
        selectedColumns.filter((col: Column) => {
          return col.accessor !== accessor;
        })
      );
    }
  };

  const handleColumnOpen = (column: string): void => {
    setColumnOrder([...columnOrder, column]);
    onChecked(column, true);
  };

  const handleColumnClose = (column: string): void => {
    onSort(column, null);
    setColumnOrder(columnOrder.filter((item) => item !== column));
    onChecked(column, false);
  };

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150 + additionalHeaderSpace,
    }),
    []
  );

  const tableInstance = useTable(
    {
      columns: selectedColumns,
      data,
      defaultColumn,
    },
    useResizeColumns,
    useFlexLayout,
    useColumnOrder
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    state,
    prepareRow,
    setColumnOrder,
    visibleColumns,
  } = tableInstance;

  const { columnOrder } = state;

  const columnOrderUpdater = (result: any): string[] => {
    const items = Array.from(visibleColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    return items.map((column: Column) => {
      return column.Header?.toString() ?? '';
    });
  };

  const handleOnDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    setColumnOrder(columnOrderUpdater(result));
  };

  return (
    <div>
      {loadedData && totalDataCount > 0 ? (
        <div>
          <div>
            <MuiTableContainer component={Paper}>
              <MuiTable {...getTableProps()}>
                <MuiTableHead>
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
                              >
                                {headerGroup.headers.map((column, index) => {
                                  const { key, ...otherHeaderProps } =
                                    column.getHeaderProps();

                                  return (
                                    <DataHeader
                                      key={key}
                                      {...otherHeaderProps}
                                      sx={{
                                        minWidth: column.minWidth,
                                        width: column.width,
                                        maxWidth: column.maxWidth,
                                        paddingTop: '0px',
                                        paddingBottom: '0px',
                                        paddingRight: '0px',
                                        display: 'flex',
                                        flexDirection: 'row',
                                      }}
                                      resizerProps={column.getResizerProps()}
                                      dataKey={column.render('id') as string}
                                      sort={sort}
                                      onSort={onSort}
                                      label={column.render('Header')}
                                      onClose={handleColumnClose}
                                      index={index}
                                      icon={columnIconMappings.get(
                                        column.id.toUpperCase()
                                      )}
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
                          return (
                            <DataCell
                              sx={{
                                minWidth: cell.column.minWidth,
                                width: cell.column.width,
                                maxWidth: cell.column.maxWidth,
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                paddingRight: '0px',
                              }}
                              key={key}
                              {...otherCellProps}
                              dataKey={key.toString()}
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
          />
          <ColumnCheckboxes
            availableColumns={availableColumns}
            selectedColumns={selectedColumns}
            onColumnOpen={handleColumnOpen}
            onColumnClose={handleColumnClose}
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
