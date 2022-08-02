import React from 'react';
import ColumnCheckboxes from '../table/columnCheckboxes.component';
import DateTimeInputBox from './dateTimeInput.component';
import RecordTable from './recordTable.component';

const DataView = React.memo((): React.ReactElement => {
  return (
    <div>
      <DateTimeInputBox />
      <br />
      <RecordTable />
      <ColumnCheckboxes />
    </div>
  );
});

export default DataView;
