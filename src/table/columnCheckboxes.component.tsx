import React from 'react';
import { Column } from 'react-table';
import { Checkbox } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  selectSelectedColumns,
  selectColumn,
  deselectColumn,
} from '../state/slices/tableSlice';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAvailableColumns } from '../api/channels';

const ColumnCheckboxes = React.memo((): React.ReactElement => {
  const { data: availableColumns } = useAvailableColumns();

  const selectableColumns = React.useMemo(
    () =>
      availableColumns?.filter((col) => {
        const accessor = col.accessor?.toString();
        return accessor && accessor.toUpperCase() !== 'TIMESTAMP';
      }) ?? [],
    [availableColumns]
  );

  const selectedColumns = useAppSelector((state) =>
    selectSelectedColumns(state, availableColumns ?? [])
  );
  const dispatch = useAppDispatch();

  const onColumnOpen = React.useCallback(
    (column: string): void => {
      dispatch(selectColumn(column));
    },
    [dispatch]
  );

  const onColumnClose = React.useCallback(
    (column: string): void => {
      dispatch(deselectColumn(column));
    },
    [dispatch]
  );

  const handleColumnChecked = React.useCallback(
    (accessor: string, checked: boolean) => {
      checked ? onColumnOpen(accessor) : onColumnClose(accessor);
    },
    [onColumnClose, onColumnOpen]
  );

  const shouldBeChecked = React.useCallback(
    (columnAccessor: string): boolean => {
      const match = selectedColumns.filter((col: Column) => {
        return col.accessor === columnAccessor;
      });

      return match && match.length > 0;
    },
    [selectedColumns]
  );

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: selectableColumns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 42,
    overscan: 20,
  });

  const CheckboxRow = React.useCallback(
    (props: { column: Column }) => {
      const { column } = props;
      const accessor = column.accessor?.toString();
      const label = column.channelInfo?.userFriendlyName
        ? column.channelInfo?.userFriendlyName
        : column.channelInfo?.systemName
        ? column.channelInfo?.systemName
        : accessor;
      return (
        <>
          <label htmlFor={accessor}>{label}</label>
          <Checkbox
            onChange={(e) => handleColumnChecked(e.target.id, e.target.checked)}
            id={accessor}
            value={accessor}
            checked={shouldBeChecked(accessor ?? '')}
            inputProps={{
              'aria-label': `${accessor} checkbox`,
            }}
          />
        </>
      );
    },
    [handleColumnChecked, shouldBeChecked]
  );

  return (
    <div style={{ overflow: 'auto', height: '150px' }} ref={parentRef}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <CheckboxRow column={selectableColumns[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
});

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
