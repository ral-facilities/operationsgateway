import React from 'react';
import { Column } from 'react-table';
import { Checkbox } from '@mui/material';

export interface ColumnCheckboxesProps {
  availableColumns: Column[];
  displayedColumns: Column[];
  onChecked: (accessor: string, checked: boolean) => void;
}

const ColumnCheckboxes = (props: ColumnCheckboxesProps): React.ReactElement => {
  const { availableColumns, displayedColumns, onChecked } = props;

  const shouldBeChecked = (columnAccessor: string): boolean => {
    const match = displayedColumns.filter((col: Column) => {
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
          onChange={(e) => onChecked(e.target.id, e.target.checked)}
          id={accessor}
          value={accessor}
          checked={shouldBeChecked(accessor)}
        />
      </div>
    ) : null;
  });

  return <div style={{ overflow: 'auto', height: '150px' }}>{checkboxes}</div>;
};

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
