import React from 'react';
import { Column } from 'react-table';
import { Checkbox } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  selectSelectedColumns,
  selectColumnDefs,
  selectColumn,
  deselectColumn,
} from '../state/slices/columnsSlice';

const ColumnCheckboxes = React.memo((): React.ReactElement => {
  const selectedColumns = useAppSelector(selectSelectedColumns);
  const columnDefs = useAppSelector(selectColumnDefs);
  const dispatch = useAppDispatch();

  const onColumnOpen = (column: string): void => {
    dispatch(selectColumn(column));
  };

  const onColumnClose = (column: string): void => {
    dispatch(deselectColumn(column));
  };

  const handleColumnChecked = (accessor: string, checked: boolean) => {
    checked ? onColumnOpen(accessor) : onColumnClose(accessor);
  };

  const shouldBeChecked = (columnAccessor: string): boolean => {
    const match = selectedColumns.filter((col: Column) => {
      return col.accessor === columnAccessor;
    });

    return match && match.length > 0;
  };

  const checkboxes = Object.keys(columnDefs).map((columnId: string) => {
    return columnId.toUpperCase() !== 'TIMESTAMP' ? (
      <div key={columnId}>
        <label htmlFor={columnId}>
          {columnDefs[columnId].Header?.toString() ?? columnId}
        </label>
        <Checkbox
          onChange={(e) => handleColumnChecked(e.target.id, e.target.checked)}
          id={columnId}
          value={columnId}
          checked={shouldBeChecked(columnId)}
          inputProps={{
            'aria-label': `${columnId} checkbox`,
          }}
        />
      </div>
    ) : null;
  });

  return <div style={{ overflow: 'auto', height: '150px' }}>{checkboxes}</div>;
});

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
