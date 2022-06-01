import React from 'react';
import { Column } from 'react-table';
import { Checkbox } from '@mui/material';

interface ColumnListProps {
  availableColumns: Column[];
  onChecked: (e: any) => void;
}

const ColumnCheckboxes = (props: ColumnListProps): React.ReactElement => {
  const { availableColumns, onChecked } = props;

  const checkboxes = availableColumns.map((column: Column) => {
    const header = column.Header?.toString() ?? 'no header';
    const accessor = column.accessor?.toString() ?? 'no accessor';
    return (
      <div>
        <label>{header}</label>
        <Checkbox onChange={onChecked} id={accessor} value={accessor} />
      </div>
    );
  });

  return <div style={{ overflow: 'auto', height: '150px' }}>{checkboxes}</div>;
};

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
