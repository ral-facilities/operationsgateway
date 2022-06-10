import React from 'react';
import { Divider, TableCell, Typography, SxProps, Grid } from '@mui/material';

export interface DataCellProps {
  sx?: SxProps;
  dataKey: string;
  rowData: any;
}

const DataCell = React.memo((props: DataCellProps): React.ReactElement => {
  const { sx, dataKey, rowData } = props;

  return (
    <TableCell size="small" component="div" sx={sx} variant="body">
      <Grid container>
        <Grid item xs>
          <Typography variant="body2" noWrap>
            {rowData}
          </Typography>
        </Grid>
        <Divider orientation="vertical" flexItem />
      </Grid>
    </TableCell>
  );
});

DataCell.displayName = 'DataCell';

export default DataCell;
