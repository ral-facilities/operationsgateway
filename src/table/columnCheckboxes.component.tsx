import React from 'react';
import { Column } from 'react-table';
import { Checkbox } from '@mui/material';

interface ColumnCheckboxesProps {
  availableColumns: Column[];
  displayedColumns: Column[];
  onChecked: (e: any) => void;
}

const ColumnCheckboxes = (props: ColumnCheckboxesProps): React.ReactElement => {
  const { availableColumns, displayedColumns, onChecked } = props;

  const shouldBeChecked = (columnHeader: string): boolean => {
    const match = displayedColumns.filter((col: Column) => {
      return col.accessor === columnHeader;
    });

    return match && match.length > 0;
  };

  const checkboxes = availableColumns.map((column: Column) => {
    const header = column.Header?.toString() ?? 'no header';
    const accessor = column.accessor?.toString() ?? 'no accessor';
    return (
      <div>
        <label>{header}</label>
        <Checkbox
          onChange={onChecked}
          id={accessor}
          value={accessor}
          checked={shouldBeChecked(header)}
        />
      </div>
    );
  });

  return <div style={{ overflow: 'auto', height: '150px' }}>{checkboxes}</div>;
};

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
