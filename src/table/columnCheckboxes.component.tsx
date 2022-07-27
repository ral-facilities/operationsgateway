import React from 'react';
import { Column } from 'react-table';
import { Checkbox } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  selectSelectedColumns,
  selectColumn,
  deselectColumn,
} from '../state/slices/columnsSlice';

export interface ColumnCheckboxesProps {
  availableColumns: Column[];
}

const ColumnCheckboxes = React.memo(
  (props: ColumnCheckboxesProps): React.ReactElement => {
    const { availableColumns } = props;
    const selectedColumns = useAppSelector(selectSelectedColumns);
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

    const checkboxes = availableColumns.map((column: Column) => {
      const accessor = column.accessor?.toString();
      const label = column.channelInfo?.userFriendlyName
        ? column.channelInfo?.userFriendlyName
        : column.channelInfo?.systemName
        ? column.channelInfo?.systemName
        : accessor;
      return accessor && accessor.toUpperCase() !== 'TIMESTAMP' ? (
        <div key={accessor}>
          <label htmlFor={accessor}>{label}</label>
          <Checkbox
            onChange={(e) => handleColumnChecked(e.target.id, e.target.checked)}
            id={accessor}
            value={accessor}
            checked={shouldBeChecked(accessor)}
            inputProps={{
              'aria-label': `${accessor} checkbox`,
            }}
          />
        </div>
      ) : null;
    });

    return (
      <div style={{ overflow: 'auto', height: '150px' }}>{checkboxes}</div>
    );
  }
);

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
