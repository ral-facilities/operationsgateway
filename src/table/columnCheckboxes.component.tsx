import React from 'react';
import { Column } from 'react-table';
import { Checkbox } from '@mui/material';

export interface ColumnCheckboxesProps {
  availableColumns: Column[];
  selectedColumns: Column[];
  onColumnOpen: (accessor: string) => void;
  onColumnClose: (accessor: string) => void;
}

const ColumnCheckboxes = (props: ColumnCheckboxesProps): React.ReactElement => {
  const { availableColumns, selectedColumns, onColumnOpen, onColumnClose } =
    props;

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
    const header = column.Header?.toString();
    const accessor = column.accessor?.toString();
    return header && accessor ? (
      <div key={accessor}>
        <label htmlFor={accessor}>{header}</label>
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

  return <div style={{ overflow: 'auto', height: '150px' }}>{checkboxes}</div>;
};

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
