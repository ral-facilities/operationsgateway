import React from 'react';
import {
  Divider,
  TableCell,
  Typography,
  SxProps,
  Grid,
  Theme,
} from '@mui/material';

export interface DataCellProps {
  sx?: SxProps<Theme>;
  dataKey: string;
  rowData: unknown;
}

const DataCell = React.memo((props: DataCellProps): React.ReactElement => {
  const { sx, rowData } = props;

  return (
    <TableCell size="small" component="td" sx={sx} variant="body">
      <Grid container>
        <Grid item xs sx={{ overflow: 'hidden' }}>
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
