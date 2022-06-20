import React from 'react';
import { Order, RecordRow } from '../app.types';
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

// 24 - the width of the close icon in header
// 4.8 - the width of the divider
const additionalHeaderSpace = 24 + 4.8;

// 31.2 - the height of a column header with the close icon included
const headerHeight = 31.2;

export interface TableProps {
  data: RecordRow[];
  displayedColumns: Column[];
  totalDataCount: number;
  page: number | null;
  loadedData: boolean;
  loadedCount: boolean;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  sort: { [column: string]: Order };
  onSort: (column: string, order: Order | null) => void;
  onClose: (column: string) => void;
}

const Table = React.memo((props: TableProps): React.ReactElement => {
  const {
    data,
    displayedColumns,
    totalDataCount,
    loadedData,
    loadedCount,
    resultsPerPage,
    onPageChange,
    sort,
    onSort,
    onClose,
  } = props;

  const [maxPage, setMaxPage] = React.useState(0);

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

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150 + additionalHeaderSpace,
    }),
    []
  );

  // displayedColumns should be left as a record of exactly WHAT data is being passed to the table instance
  // As such, it is best to not use or amend it otherwise
  // Instead, refer to visibleColumns for a record of what is currently being displayed
  // visibleColumns also contains exact details of how columns are being displayed, e.g. width, isResizing, etc.
  const tableInstance = useTable(
    {
      columns: displayedColumns,
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
    prepareRow,
    setColumnOrder,
    visibleColumns,
  } = tableInstance;

  const updater = (result: any): string[] => {
    // Unlike displayedColumns, visibleColumns retains the current column order
    const items = Array.from(visibleColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    return items.map((column: Column) => {
      return column.Header?.toString() ?? '';
    });
  };

  const handleOnDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    setColumnOrder(updater(result));
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
                      <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="columns" direction="horizontal">
                          {(provided) => {
                            return (
                              <MuiTableRow
                                key={key}
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
                                        display: 'flex',
                                        flexDirection: 'row',
                                      }}
                                      resizerProps={column.getResizerProps()}
                                      dataKey={column.render('id') as string}
                                      sort={sort}
                                      onSort={onSort}
                                      label={column.render('Header')}
                                      onClose={onClose}
                                      index={index}
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
