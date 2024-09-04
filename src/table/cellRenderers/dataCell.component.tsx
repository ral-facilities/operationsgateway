import {
  Divider,
  Grid,
  SxProps,
  TableCell,
  Theme,
  Typography,
} from '@mui/material';
import React from 'react';

export interface DataCellProps {
  sx?: SxProps<Theme>;
  dataKey: string;
  rowData: React.ReactNode;
}

const DataCell = React.memo((props: DataCellProps): React.ReactElement => {
  const { sx, rowData } = props;

  return (
    <TableCell size="small" component="td" sx={sx} variant="body">
      <Grid container>
        <Grid
          item
          xs
          sx={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}
        >
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
