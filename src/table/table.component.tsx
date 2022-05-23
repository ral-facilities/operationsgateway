import React from "react";
import { Record } from "../app.types";
import { Column, useTable } from "react-table";

interface TableProps {
  data: Record[];
  columns: Column[];
  totalDataCount: number;
  page: number | null;
  loadedData: boolean;
  loadedCount: boolean;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
}

const Table = React.memo((props: TableProps): React.ReactElement => {
  const {
    data,
    columns,
    totalDataCount,
    loadedData,
    loadedCount,
    resultsPerPage,
    onPageChange,
  } = props;

  const [maxPage, setMaxPage] = React.useState(1);

  const page = React.useMemo(() => {
    return props.page && props.page > 0 ? props.page : 1;
  }, [props.page]);

  React.useEffect(() => {
    if (loadedCount) {
      const newMaxPage = ~~(1 + (totalDataCount - 1) / resultsPerPage);
      if (newMaxPage !== maxPage) {
        setMaxPage(newMaxPage);
      } else if (maxPage > 0 && page > newMaxPage) {
        onPageChange(1);
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

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div>
      {loadedData && totalDataCount > 0 ? (
        <div>
          <div>
            {/* apply the table props */}
            <table {...getTableProps()}>
              <thead>
                {
                  // Loop over the header rows
                  headerGroups.map((headerGroup) => {
                    const { key, ...otherHeaderGroupProps } =
                      headerGroup.getHeaderGroupProps();
                    return (
                      // Apply the header row props
                      <tr key={key} {...otherHeaderGroupProps}>
                        {
                          // Loop over the headers in each row
                          headerGroup.headers.map((column) => {
                            const { key, ...otherHeaderProps } =
                              column.getHeaderProps();
                            return (
                              // Apply the header cell props
                              <th key={key} {...otherHeaderProps}>
                                {
                                  // Render the header
                                  column.render("Header")
                                }
                              </th>
                            );
                          })
                        }
                      </tr>
                    );
                  })
                }
              </thead>
              {/* Apply the table body props */}
              <tbody {...getTableBodyProps()}>
                {
                  // Loop over the table rows
                  rows.map((row) => {
                    // Prepare the row for display
                    prepareRow(row);
                    const { key, ...otherRowProps } = row.getRowProps();
                    return (
                      // Apply the row props
                      <tr key={key} {...otherRowProps}>
                        {
                          // Loop over the row cells
                          row.cells.map((cell) => {
                            const { key, ...otherCellProps } =
                              cell.getCellProps();
                            // Apply the cell props
                            return (
                              <td key={key} {...otherCellProps}>
                                {
                                  // Render the cell contents
                                  cell.render("Cell")
                                }
                              </td>
                            );
                          })
                        }
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
          <div>
            <p>
              Page count: {page}/{Math.ceil(totalDataCount / resultsPerPage)}
            </p>
          </div>
          <div>
            <button onClick={() => onPageChange(page - 1 >= 1 ? page - 1 : 1)}>
              Previous
            </button>
            <button
              onClick={() => page + 1 <= maxPage && onPageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
});

export default Table;
