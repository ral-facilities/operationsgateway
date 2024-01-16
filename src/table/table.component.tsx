import React from 'react';
import {
  Order,
  RecordRow,
  columnIconMappings,
  ColumnState,
  SearchParams,
  timeChannelName,
} from '../app.types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnOrderState,
  flexRender,
  ColumnDef,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Backdrop,
  TableContainer as MuiTableContainer,
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TablePagination as MuiTablePagination,
  TableCell as MuiTableCell,
  Checkbox,
  Paper,
  SxProps,
  Theme,
  CircularProgress,
  Typography,
} from '@mui/material';
import DataHeader from './headerRenderers/dataHeader.component';
import DataCell from './cellRenderers/dataCell.component';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

// 24 - the width of the close icon in header
// 4.8 - the width of the divider
const additionalHeaderSpace = 24 + 4.8;

const stickyColumnStyles: SxProps<Theme> = {
  position: 'sticky',
  left: 0,
  // TODO: see if it is necessary to set the background color here
  // backgroundColor: (theme) => theme.palette.background.default,
  zIndex: 2,
};

export interface TableProps {
  tableHeight: string;
  data: RecordRow[];
  availableColumns: ColumnDef<RecordRow>[];
  columnStates: { [id: string]: ColumnState };
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  totalDataCount: number;
  maxShots: SearchParams['maxShots'];
  page: number;
  loadedData: boolean;
  loadedCount: boolean;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange: (resultsPerPage: number) => void;
  sort: { [column: string]: Order };
  onSort: (column: string, order: Order | null) => void;
  onColumnWordWrapToggle: (column: string) => void;
  onDragEnd: (result: DropResult) => void;
  onColumnClose: (column: string) => void;
  openFilters: (headerName: string) => void;
  filteredChannelNames: string[];
}

const Table = React.memo((props: TableProps): React.ReactElement => {
  const {
    tableHeight,
    data,
    availableColumns,
    columnStates,
    columnVisibility,
    columnOrder,
    totalDataCount,
    maxShots,
    loadedData,
    page,
    resultsPerPage,
    onPageChange,
    onResultsPerPageChange,
    sort,
    onSort,
    onColumnWordWrapToggle,
    onDragEnd,
    onColumnClose,
    openFilters,
    filteredChannelNames,
  } = props;

  const [rowSelection, setRowSelection] = React.useState({});

  const defaultColumn: Partial<ColumnDef<RecordRow>> = React.useMemo(
    () => ({
      minSize: 33,
      size: 150 + additionalHeaderSpace,
    }),
    []
  );

  const tableInstance = useReactTable({
    columns: availableColumns,
    data,
    defaultColumn,
    state: {
      columnOrder,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row._id,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: 'onChange',
  });

  return (
    <div>
      {loadedData && totalDataCount <= 0 && (
        <Paper sx={{ padding: 1, margin: 1 }} aria-label="no results message">
          <Typography align="center" variant="h6" component="h6">
            No results found with current filters applied, please modify filter
            settings and try again.
          </Typography>
        </Paper>
      )}
      <MuiTableContainer
        role="table-container"
        component={Paper}
        sx={{
          background: 'unset',
          overflow: 'auto',
          maxHeight: tableHeight,
        }}
      >
        <MuiTable>
          <MuiTableHead
            sx={{
              position: 'sticky',
              backgroundColor: (theme) => theme.palette.background.default,
              top: 0,
              zIndex: 1,
            }}
          >
            {tableInstance.getHeaderGroups().map((headerGroup) => {
              return (
                <DragDropContext key={headerGroup.id} onDragEnd={onDragEnd}>
                  <Droppable droppableId="columns" direction="horizontal">
                    {(provided) => {
                      return (
                        <MuiTableRow
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          sx={{ display: 'flex', flexDirection: 'row' }}
                        >
                          <MuiTableCell
                            padding="none"
                            variant="head"
                            role="columnheader"
                            aria-label="Select all rows"
                          >
                            <Checkbox
                              inputProps={{ 'aria-label': 'select all rows' }}
                              size="small"
                              color="primary"
                              checked={tableInstance.getIsAllPageRowsSelected()}
                              indeterminate={tableInstance.getIsSomePageRowsSelected()}
                              // toggle all rows on current page
                              onChange={tableInstance.getToggleAllPageRowsSelectedHandler()}
                            />
                          </MuiTableCell>
                          {headerGroup.headers.map((header, index) => {
                            const { column } = header;
                            const dataKey = column.id;
                            const isTimestampColumn =
                              dataKey === timeChannelName;
                            let columnStyles: SxProps<Theme> = {
                              width: column.getSize(),
                              paddingTop: '0px',
                              paddingBottom: '0px',
                              paddingRight: '0px',
                              display: 'flex',
                              flexDirection: 'row',
                              overflow: 'hidden',
                              alignItems: 'center',
                            };

                            columnStyles = isTimestampColumn
                              ? {
                                  ...columnStyles,
                                  ...stickyColumnStyles,
                                }
                              : columnStyles;
                            const channelInfo =
                              column.columnDef.meta?.channelInfo;
                            return (
                              <DataHeader
                                key={header.id}
                                sx={columnStyles}
                                resizeHandler={header.getResizeHandler()}
                                dataKey={dataKey}
                                sort={sort}
                                onSort={onSort}
                                label={flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                onClose={onColumnClose}
                                index={index}
                                icon={columnIconMappings.get(column.id)}
                                channelInfo={channelInfo}
                                wordWrap={
                                  columnStates[dataKey]?.wordWrap ?? false
                                }
                                onToggleWordWrap={onColumnWordWrapToggle}
                                isFiltered={filteredChannelNames.includes(
                                  dataKey
                                )}
                                openFilters={openFilters}
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
          <MuiTableBody
            sx={{ position: 'relative', zIndex: 0 }}
            aria-describedby="table-loading-indicator"
            aria-busy={!loadedData}
          >
            {tableInstance.getRowModel().rows.map((row) => {
              return (
                <MuiTableRow
                  key={row.original._id}
                  sx={{ display: 'flex', flexDirection: 'row' }}
                  selected={row.getIsSelected()}
                  aria-checked={row.getIsSelected()}
                >
                  <MuiTableCell
                    scope="row"
                    padding="none"
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Checkbox
                      size="small"
                      inputProps={{ 'aria-label': 'select row' }}
                      sx={{ paddingTop: '5px', paddingBottom: '5px' }}
                      checked={row.getIsSelected()}
                      disabled={!row.getCanSelect()}
                      onChange={row.getToggleSelectedHandler()}
                    />
                  </MuiTableCell>

                  {row.getVisibleCells().map((cell) => {
                    const dataKey = cell.column.id;
                    const isTimestampColumn = dataKey === timeChannelName;

                    let columnStyles: SxProps<Theme> = {
                      width: cell.column.getSize(),
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
                        key={cell.id}
                        dataKey={cell.column.id}
                        rowData={flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      />
                    );
                  })}
                </MuiTableRow>
              );
            })}
            {/* Need to make this a tr with a td column with the correct colSpan 
                    to be a valid HTML table */}
            {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
            <Backdrop
              component="tr"
              sx={{ position: 'absolute', zIndex: 100, height: 'inherit' }}
              open={!loadedData}
              role="none"
              aria-hidden={false}
            >
              <td colSpan={columnOrder.length > 0 ? columnOrder.length : 1}>
                <CircularProgress id="table-loading-indicator" />
              </td>
            </Backdrop>
          </MuiTableBody>
        </MuiTable>
      </MuiTableContainer>
      <MuiTablePagination
        component="div"
        count={maxShots > totalDataCount ? totalDataCount : maxShots}
        onPageChange={(e, page) => onPageChange(page)}
        page={page}
        rowsPerPage={resultsPerPage}
        rowsPerPageOptions={maxShots === 50 ? [10, 25, 50] : [10, 25, 50, 100]}
        onRowsPerPageChange={(event) =>
          onResultsPerPageChange(parseInt(event.target.value))
        }
      />
    </div>
  );
});

export default Table;
